import { describe, it, expect, beforeEach } from 'vitest';
import { PDFParserService } from '../../src/services/pdf-parser.service.js';
import * as fsNode from 'fs';
import * as path from 'path';

describe('PDFParserService', () => {
  let parser: PDFParserService;

  beforeEach(() => {
    parser = new PDFParserService();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      expect(parser).toBeInstanceOf(PDFParserService);
      const options = parser.getOptions();
      expect(options.detectHeadings).toBe(true);
      expect(options.preservePageBoundaries).toBe(true);
    });

    it('should accept custom options', () => {
      const customParser = new PDFParserService({ maxPages: 10, detectHeadings: false });
      const options = customParser.getOptions();
      expect(options.maxPages).toBe(10);
      expect(options.detectHeadings).toBe(false);
    });
  });

  describe('parseFromPath', () => {
    it('should return FILE_NOT_FOUND error for non-existent file', async () => {
      const result = await parser.parseFromPath('/non/existent/file.pdf');
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FILE_NOT_FOUND');
    });

    it('should return INVALID_PDF error for non-PDF file extension', async () => {
      const tempDir = path.dirname(import.meta.url.replace('file:///', ''));
      const tempPath = path.join(tempDir, 'temp-test.txt');
      fsNode.writeFileSync(tempPath, 'test content');
      
      try {
        const result = await parser.parseFromPath(tempPath);
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_PDF');
        expect(result.error?.message).toContain('.txt');
      } finally {
        fsNode.unlinkSync(tempPath);
      }
    });
  });

  describe('parseFromBuffer', () => {
    it('should return EMPTY_PDF error for empty buffer', async () => {
      const result = await parser.parseFromBuffer(Buffer.from(''));
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMPTY_PDF');
    });

    it('should return INVALID_PDF error for non-PDF buffer', async () => {
      const result = await parser.parseFromBuffer(Buffer.from('not a pdf'));
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_PDF');
      expect(result.error?.message).toContain('header signature');
    });

    it('should handle malformed PDF gracefully', async () => {
      // Start with PDF header but have invalid content
      const malformedPDF = Buffer.from('%PDF-1.4 invalid content');
      const result = await parser.parseFromBuffer(malformedPDF);
      // Should either succeed with empty content or return an error
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('setOptions', () => {
    it('should update parser options', () => {
      parser.setOptions({ maxPages: 5 });
      expect(parser.getOptions().maxPages).toBe(5);
    });

    it('should merge with existing options', () => {
      parser.setOptions({ maxPages: 5 });
      parser.setOptions({ detectHeadings: false });
      const options = parser.getOptions();
      expect(options.maxPages).toBe(5);
      expect(options.detectHeadings).toBe(false);
    });
  });

  describe('getOptions', () => {
    it('should return a copy of options', () => {
      const options1 = parser.getOptions();
      const options2 = parser.getOptions();
      expect(options1).toEqual(options2);
      expect(options1).not.toBe(options2);
    });
  });

  describe('error handling', () => {
    it('should have valid error codes', async () => {
      const validCodes = ['EMPTY_PDF', 'INVALID_PDF', 'ENCRYPTED_PDF', 'CORRUPTED_PDF', 'PARSE_ERROR', 'MEMORY_ERROR', 'TIMEOUT_ERROR', 'UNKNOWN_ERROR', 'FILE_NOT_FOUND'];
      const result = await parser.parseFromBuffer(Buffer.from(''));
      expect(validCodes).toContain(result.error?.code);
    });
  });
});
