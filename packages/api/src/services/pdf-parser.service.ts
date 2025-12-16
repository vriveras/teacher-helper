/**
 * PDF Parser Service for TeacherHelper KB-Ingestion
 *
 * Extracts text content, metadata, and structure from PDF files
 * to support the book upload -> chunk -> index pipeline.
 */

import * as fsNode from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import type {
  PDFMetadata,
  PDFPage,
  PDFHeading,
  PDFSection,
  ParsedPDF,
  PDFParserOptions,
  PDFParseResult,
  PDFErrorCode,
} from '@teacher-helper/shared';
import { DEFAULT_PDF_PARSER_OPTIONS } from '@teacher-helper/shared';

// Type for pdf-parse result
interface PDFData {
  numpages: number;
  numrender: number;
  info: Record<string, string>;
  metadata: Record<string, unknown> | null;
  version: string;
  text: string;
}

export class PDFParserService {
  private options: PDFParserOptions;

  constructor(options: Partial<PDFParserOptions> = {}) {
    this.options = { ...DEFAULT_PDF_PARSER_OPTIONS, ...options };
  }
  async parseFromPath(filePath: string): Promise<PDFParseResult> {
    try {
      if (!fsNode.existsSync(filePath)) {
        return this.createError('FILE_NOT_FOUND', `File not found: ${filePath}`);
      }

      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.pdf') {
        return this.createError('INVALID_PDF', `Invalid file extension: ${ext}. Expected .pdf`);
      }

      const buffer = fsNode.readFileSync(filePath);
      return this.parseFromBuffer(buffer);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async parseFromBuffer(buffer: Buffer): Promise<PDFParseResult> {
    try {
      if (!buffer || buffer.length === 0) {
        return this.createError('EMPTY_PDF', 'Empty PDF buffer provided');
      }

      const header = buffer.slice(0, 5).toString('ascii');
      if (header !== '%PDF-') {
        return this.createError('INVALID_PDF', 'Invalid PDF format: missing PDF header signature');
      }

      const pdfData = await (pdfParse as unknown as (buffer: Buffer, options?: { max?: number }) => Promise<PDFData>)(buffer, {
        max: this.options.maxPages || 0,
      });

      const metadata = this.extractMetadata(pdfData);
      const pages = this.extractPages(pdfData);

      const fullText = this.options.preservePageBoundaries
        ? pages.map((p) => p.text).join('\n\n--- Page Break ---\n\n')
        : pdfData.text;

      const headings = this.options.detectHeadings ? this.detectHeadings(pages) : [];
      const sections = this.buildSections(pages, headings);

      const parsedPDF: ParsedPDF = {
        metadata,
        fullText,
        pages,
        headings,
        sections,
        totalCharacters: fullText.length,
        estimatedWordCount: this.countWords(fullText),
      };

      return { success: true, data: parsedPDF };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private extractMetadata(pdfData: PDFData): PDFMetadata {
    const info = pdfData.info || {};
    return {
      title: info.Title || undefined,
      author: info.Author || undefined,
      subject: info.Subject || undefined,
      keywords: info.Keywords || undefined,
      creator: info.Creator || undefined,
      producer: info.Producer || undefined,
      creationDate: this.parseDate(info.CreationDate),
      modificationDate: this.parseDate(info.ModDate),
      pageCount: pdfData.numpages || 0,
      pdfVersion: pdfData.version || undefined,
      isEncrypted: Boolean(info.IsAcroFormPresent),
    };
  }

  private extractPages(pdfData: PDFData): PDFPage[] {
    const text = pdfData.text || '';
    const pageCount = pdfData.numpages || 1;

    if (pageCount === 1) {
      return [{ pageNumber: 1, text: text.trim(), characterCount: text.trim().length }];
    }

    const formFeedSplit = text.split(/\f/);
    if (formFeedSplit.length === pageCount) {
      return formFeedSplit.map((pageText: string, index: number) => ({
        pageNumber: index + 1,
        text: pageText.trim(),
        characterCount: pageText.trim().length,
      }));
    }

    const avgCharsPerPage = Math.ceil(text.length / pageCount);
    const pages: PDFPage[] = [];

    for (let i = 0; i < pageCount; i++) {
      const start = i * avgCharsPerPage;
      const end = Math.min((i + 1) * avgCharsPerPage, text.length);
      const pageText = text.slice(start, end).trim();
      pages.push({ pageNumber: i + 1, text: pageText, characterCount: pageText.length });
    }

    return pages;
  }

  private detectHeadings(pages: PDFPage[]): PDFHeading[] {
    const headings: PDFHeading[] = [];
    const patterns = this.options.headingPatterns || [];
    const minLen = this.options.minHeadingLength || 3;
    const maxLen = this.options.maxHeadingLength || 150;

    const regexPatterns = patterns
      .map((p) => { try { return new RegExp(p, 'gm'); } catch { return null; } })
      .filter((r): r is RegExp => r !== null);

    for (const page of pages) {
      const lines = page.text.split('\n');
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex]?.trim() || "";
        if (line.length < minLen || line.length > maxLen) continue;

        for (let pi = 0; pi < regexPatterns.length; pi++) {
          const regex = regexPatterns[pi];
          if (!regex) continue;
          regex.lastIndex = 0;
          if (regex && regex.test(line)) {
            const level = pi < 2 ? 1 : pi < 4 ? 2 : 3;
            headings.push({ text: line, level, pageNumber: page.pageNumber, position: lineIndex });
            break;
          }
        }
      }
    }
    return headings;
  }

  private buildSections(pages: PDFPage[], headings: PDFHeading[]): PDFSection[] {
    if (headings.length === 0) {
      return [{ level: 0, pageStart: 1, pageEnd: pages.length, text: pages.map((p) => p.text).join('\n\n') }];
    }

    const sections: PDFSection[] = [];
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      if (!heading) continue;
      const nextHeading = headings[i + 1];
      const pageStart = heading.pageNumber;
      const pageEnd = nextHeading ? nextHeading.pageNumber : pages.length;

      const sectionPages = pages.filter((p) => p.pageNumber >= pageStart && p.pageNumber <= pageEnd);
      let sectionText = '';

      for (const page of sectionPages) {
        if (page.pageNumber === pageStart) {
          const lines = page.text.split('\n');
          const idx = lines.findIndex((l) => l.trim() === heading.text);
          sectionText += idx >= 0 ? lines.slice(idx + 1).join('\n') : page.text;
        } else if (page.pageNumber === pageEnd && nextHeading) {
          const lines = page.text.split('\n');
          const idx = lines.findIndex((l) => l.trim() === nextHeading.text);
          sectionText += '\n' + (idx >= 0 ? lines.slice(0, idx).join('\n') : page.text);
        } else {
          sectionText += '\n' + page.text;
        }
      }

      sections.push({ heading: heading.text, level: heading.level, pageStart, pageEnd, text: sectionText.trim() });
    }
    return sections;
  }

  private parseDate(dateStr: string | undefined): Date | undefined {
    if (!dateStr) return undefined;
    try {
      if (dateStr.startsWith('D:')) {
        const c = dateStr.slice(2);
        return new Date(
          parseInt(c.slice(0, 4), 10),
          parseInt(c.slice(4, 6), 10) - 1,
          parseInt(c.slice(6, 8), 10),
          parseInt(c.slice(8, 10), 10) || 0,
          parseInt(c.slice(10, 12), 10) || 0,
          parseInt(c.slice(12, 14), 10) || 0
        );
      }
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date;
    } catch { return undefined; }
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  private createError(code: PDFErrorCode, message: string, details?: string): PDFParseResult {
    return { success: false, error: { code, message, details } };
  }

  private handleError(error: unknown): PDFParseResult {
    const err = error as Error;
    const message = err?.message || 'Unknown error occurred';
    let code: PDFErrorCode = 'UNKNOWN_ERROR';

    if (message.includes('encrypted') || message.includes('password')) code = 'ENCRYPTED_PDF';
    else if (message.includes('Invalid PDF') || message.includes('not a PDF')) code = 'INVALID_PDF';
    else if (message.includes('corrupt') || message.includes('damaged')) code = 'CORRUPTED_PDF';
    else if (message.includes('ENOMEM') || message.includes('memory')) code = 'MEMORY_ERROR';
    else if (message.includes('timeout') || message.includes('ETIMEDOUT')) code = 'TIMEOUT_ERROR';

    return { success: false, error: { code, message, cause: err } };
  }

  setOptions(options: Partial<PDFParserOptions>): void {
    this.options = { ...this.options, ...options };
  }

  getOptions(): PDFParserOptions {
    return { ...this.options };
  }
}

export const pdfParserService = new PDFParserService();

