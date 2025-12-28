// Chunking Service for TeacherHelper KB-Ingestion
import { createHash } from 'crypto';
import { encode } from 'gpt-tokenizer';
import type { ChunkingConfig, ParsedPDF, PDFSection } from '@teacher-helper/shared';
import { DEFAULT_CHUNKING_CONFIG } from '@teacher-helper/shared';
import type { ChunkingInput, ChunkingResult, ChunkData, ChunkMetadata, ChunkingStats, ChunkingErrorCode, TextSegment } from '@teacher-helper/shared';

const PARA_SEP = '\n\n';

export class ChunkingService {
  private config: ChunkingConfig;
  constructor(config: Partial<ChunkingConfig> = {}) { this.config = { ...DEFAULT_CHUNKING_CONFIG, ...config }; }

  chunkDocument(input: ChunkingInput): ChunkingResult {
    const config = { ...this.config, ...input.config };
    if (!input.parsedPdf) return this.createError('EMPTY_DOCUMENT', 'No parsed PDF provided');
    if (!input.parsedPdf.fullText?.trim()) return this.createError('NO_TEXT_CONTENT', 'Parsed PDF has no text');
    try {
      const stats: ChunkingStats = { totalChunks: 0, averageTokens: 0, minTokens: Infinity, maxTokens: 0, totalTokens: 0, paragraphsProcessed: 0, sectionsProcessed: 0, mergeCount: 0, splitCount: 0 };
      let chunks: ChunkData[] = config.respectSectionBoundaries && input.parsedPdf.sections.length > 0 ? this.chunkBySections(input.parsedPdf, config, stats) : this.chunkByPages(input.parsedPdf, config, stats);
      chunks = this.mergeSmallChunks(chunks, config, stats);
      chunks = chunks.map((c, i) => ({ ...c, sequence: i }));
      stats.totalChunks = chunks.length;
      if (chunks.length > 0) { stats.averageTokens = Math.round(stats.totalTokens / chunks.length); stats.minTokens = Math.min(...chunks.map(c => c.tokenCount)); stats.maxTokens = Math.max(...chunks.map(c => c.tokenCount)); } else { stats.minTokens = 0; }
      return { success: true, chunks, stats, config };
    } catch (e) { const err = e as Error; return this.createError('UNKNOWN_ERROR', 'Chunking failed: ' + err.message, err.stack); }
  }

  private chunkBySections(pdf: ParsedPDF, config: ChunkingConfig, stats: ChunkingStats): ChunkData[] {
    const chunks: ChunkData[] = []; let seq = 0;
    for (const s of pdf.sections) { stats.sectionsProcessed++; for (const ch of this.processSection(s, config, stats, seq)) { chunks.push(ch); seq++; } }
    return chunks;
  }

  private processSection(section: PDFSection, config: ChunkingConfig, stats: ChunkingStats, startSeq: number): ChunkData[] {
    const chunks: ChunkData[] = []; const paragraphs = this.splitIntoParagraphs(section.text); let seq = startSeq;
    const meta: ChunkMetadata = { chapter: section.level === 1 ? section.heading : undefined, section: section.level > 1 ? section.heading : undefined, pageStart: section.pageStart, pageEnd: section.pageEnd, headingContext: section.heading };
    let cur: TextSegment = { text: '', tokenCount: 0, pageNumbers: [section.pageStart], headingContext: section.heading };
    for (const p of paragraphs) {
      stats.paragraphsProcessed++; const tp = p.trim(); if (!tp) continue;
      const pt = this.countTokens(tp);
      if (pt > config.maxTokens) {
        if (cur.tokenCount >= config.minTokens) { chunks.push(this.createChunk(cur, meta, seq++)); cur = { text: '', tokenCount: 0, pageNumbers: [section.pageStart], headingContext: section.heading }; }
        const sc = this.splitLargeParagraph(tp, config, stats, meta, seq);
        if (cur.tokenCount > 0 && sc.length > 0 && sc[0]) { const ct = cur.text + PARA_SEP + sc[0].text; const cto = this.countTokens(ct); if (cto <= config.maxTokens) { sc[0].text = ct; sc[0].tokenCount = cto; } else { chunks.push(this.createChunk(cur, meta, seq++)); } cur = { text: '', tokenCount: 0, pageNumbers: [section.pageStart], headingContext: section.heading }; }
        for (const x of sc) { chunks.push(x); seq++; } stats.splitCount++; continue;
      }
      const ct = cur.tokenCount > 0 ? this.countTokens(cur.text + PARA_SEP + tp) : pt;
      if (ct > config.maxTokens) { if (cur.tokenCount >= config.minTokens) { chunks.push(this.createChunk(cur, meta, seq++)); cur = { text: tp, tokenCount: pt, pageNumbers: [section.pageStart], headingContext: section.heading }; } else { cur.text = cur.text ? cur.text + PARA_SEP + tp : tp; cur.tokenCount = ct; } }
      else { cur.text = cur.text ? cur.text + PARA_SEP + tp : tp; cur.tokenCount = ct; }
    }
    if (cur.tokenCount > 0) chunks.push(this.createChunk(cur, meta, seq));
    return chunks;
  }

  private chunkByPages(pdf: ParsedPDF, config: ChunkingConfig, stats: ChunkingStats): ChunkData[] {
    const chunks: ChunkData[] = []; let seq = 0; let cur: TextSegment = { text: '', tokenCount: 0, pageNumbers: [] };
    for (const pg of pdf.pages) {
      for (const p of this.splitIntoParagraphs(pg.text)) {
        stats.paragraphsProcessed++; const tp = p.trim(); if (!tp) continue; const pt = this.countTokens(tp);
        if (pt > config.maxTokens) { if (cur.tokenCount >= config.minTokens) chunks.push(this.createChunk(cur, { pageStart: cur.pageNumbers[0], pageEnd: cur.pageNumbers[cur.pageNumbers.length - 1] }, seq++)); for (const x of this.splitLargeParagraph(tp, config, stats, { pageStart: pg.pageNumber, pageEnd: pg.pageNumber }, seq)) { chunks.push(x); seq++; } cur = { text: '', tokenCount: 0, pageNumbers: [] }; stats.splitCount++; continue; }
        const ct = cur.tokenCount > 0 ? this.countTokens(cur.text + PARA_SEP + tp) : pt;
        if (ct > config.maxTokens) { if (cur.tokenCount >= config.minTokens) chunks.push(this.createChunk(cur, { pageStart: cur.pageNumbers[0], pageEnd: cur.pageNumbers[cur.pageNumbers.length - 1] }, seq++)); cur = { text: tp, tokenCount: pt, pageNumbers: [pg.pageNumber] }; }
        else { cur.text = cur.text ? cur.text + PARA_SEP + tp : tp; cur.tokenCount = ct; if (!cur.pageNumbers.includes(pg.pageNumber)) cur.pageNumbers.push(pg.pageNumber); }
      }
    }
    if (cur.tokenCount > 0) chunks.push(this.createChunk(cur, { pageStart: cur.pageNumbers[0], pageEnd: cur.pageNumbers[cur.pageNumbers.length - 1] }, seq));
    return chunks;
  }

  private splitLargeParagraph(text: string, config: ChunkingConfig, stats: ChunkingStats, meta: ChunkMetadata, startSeq: number): ChunkData[] {
    const chunks: ChunkData[] = []; let seq = startSeq; const sents = this.splitIntoSentences(text); let cur = { text: '', tokenCount: 0 };
    for (const s of sents) {
      const st = this.countTokens(s);
      if (st > config.maxTokens) { if (cur.tokenCount >= config.minTokens) { chunks.push(this.createChunk({ ...cur, pageNumbers: [], headingContext: meta.headingContext }, meta, seq++)); stats.totalTokens += cur.tokenCount; } for (const wc of this.splitByWords(s, config)) { chunks.push(this.createChunk({ text: wc.text, tokenCount: wc.tokenCount, pageNumbers: [], headingContext: meta.headingContext }, meta, seq++)); stats.totalTokens += wc.tokenCount; } cur = { text: '', tokenCount: 0 }; continue; }
      const ct = cur.tokenCount > 0 ? this.countTokens(cur.text + ' ' + s) : st;
      if (ct > config.maxTokens) { if (cur.tokenCount >= config.minTokens) { chunks.push(this.createChunk({ ...cur, pageNumbers: [], headingContext: meta.headingContext }, meta, seq++)); stats.totalTokens += cur.tokenCount; } cur = { text: s, tokenCount: st }; } else { cur.text = cur.text ? cur.text + ' ' + s : s; cur.tokenCount = ct; }
    }
    if (cur.tokenCount > 0) { chunks.push(this.createChunk({ ...cur, pageNumbers: [], headingContext: meta.headingContext }, meta, seq)); stats.totalTokens += cur.tokenCount; }
    return chunks;
  }

  private splitByWords(text: string, config: ChunkingConfig): Array<{ text: string; tokenCount: number }> {
    const chunks: Array<{ text: string; tokenCount: number }> = []; const words = text.split(/\s+/); let cw: string[] = []; let ct = 0;
    for (const w of words) { if (!w) continue; const wt = this.countTokens(w); const nt = ct + wt + (cw.length > 0 ? 1 : 0); if (nt > config.targetTokens && cw.length > 0) { const tx = cw.join(' '); chunks.push({ text: tx, tokenCount: this.countTokens(tx) }); const olc = Math.max(1, Math.floor((config.overlapTokens / config.targetTokens) * cw.length)); cw = cw.slice(-olc); cw.push(w); ct = this.countTokens(cw.join(' ')); } else { cw.push(w); ct = nt; } }
    if (cw.length > 0) { const tx = cw.join(' '); chunks.push({ text: tx, tokenCount: this.countTokens(tx) }); }
    return chunks;
  }

  private mergeSmallChunks(chunks: ChunkData[], config: ChunkingConfig, stats: ChunkingStats): ChunkData[] {
    if (chunks.length < 2) return chunks; const merged: ChunkData[] = []; let cur: ChunkData | null = null;
    for (const ch of chunks) { if (!cur) { cur = { ...ch }; continue; } if (cur.tokenCount < config.minTokens) { const ct = cur.text + PARA_SEP + ch.text; const cto = this.countTokens(ct); if (cto <= config.maxTokens) { cur.text = ct; cur.tokenCount = cto; cur.hash = this.generateHash(ct); cur.metadata.pageEnd = ch.metadata.pageEnd || cur.metadata.pageEnd; stats.mergeCount++; continue; } } merged.push(cur); stats.totalTokens += cur.tokenCount; cur = { ...ch }; }
    if (cur) { merged.push(cur); stats.totalTokens += cur.tokenCount; }
    return merged;
  }

  private createChunk(seg: TextSegment | { text: string; tokenCount: number; pageNumbers?: number[]; headingContext?: string }, meta: ChunkMetadata, seq: number): ChunkData {
    const t = seg.text.trim(); return { text: t, tokenCount: seg.tokenCount || this.countTokens(t), sequence: seq, hash: this.generateHash(t), metadata: { ...meta, headingContext: seg.headingContext || meta.headingContext } };
  }

  countTokens(text: string): number { if (!text) return 0; try { return encode(text).length; } catch { return Math.ceil(text.length / 4); } }
  private splitIntoParagraphs(text: string): string[] { return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0); }
  private splitIntoSentences(text: string): string[] { const s = text.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length > 0); return s.length > 0 ? s : [text]; }
  private generateHash(text: string): string { return createHash('sha256').update(text).digest('hex'); }
  private createError(code: ChunkingErrorCode, message: string, details?: string): ChunkingResult { return { success: false, chunks: [], stats: { totalChunks: 0, averageTokens: 0, minTokens: 0, maxTokens: 0, totalTokens: 0, paragraphsProcessed: 0, sectionsProcessed: 0, mergeCount: 0, splitCount: 0 }, config: this.config, error: { code, message, details } }; }
  setConfig(config: Partial<ChunkingConfig>): void { this.config = { ...this.config, ...config }; }
  getConfig(): ChunkingConfig { return { ...this.config }; }
}

export const chunkingService = new ChunkingService();
