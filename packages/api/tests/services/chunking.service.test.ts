import { describe, it, expect, beforeEach } from 'vitest';
import { ChunkingService } from '../../src/services/chunking.service.js';
import type { ParsedPDF, PDFSection, PDFPage, ChunkingConfig } from '@teacher-helper/shared';

// Helper to create a mock parsed PDF
function createMockPDF(options: { pages?: PDFPage[]; sections?: PDFSection[]; fullText?: string }): ParsedPDF {
  return {
    metadata: { pageCount: options.pages?.length || 1 },
    fullText: options.fullText || options.pages?.map(p => p.text).join('\n\n') || '',
    pages: options.pages || [{ pageNumber: 1, text: options.fullText || '', characterCount: (options.fullText || '').length }],
    headings: [],
    sections: options.sections || [],
    totalCharacters: (options.fullText || '').length,
    estimatedWordCount: (options.fullText || '').split(/\s+/).length,
  };
}

// Generate text with approximately N tokens (1 token ~ 4 chars for simple text)
function generateText(approxTokens: number): string {
  const words = [];
  let tokens = 0;
  while (tokens < approxTokens) {
    words.push('word');
    tokens += 1; // 'word' is roughly 1 token
  }
  return words.join(' ');
}

describe('ChunkingService', () => {
  let service: ChunkingService;

  beforeEach(() => {
    service = new ChunkingService();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(service).toBeInstanceOf(ChunkingService);
      const config = service.getConfig();
      expect(config.minTokens).toBe(300);
      expect(config.maxTokens).toBe(800);
      expect(config.targetTokens).toBe(500);
      expect(config.overlapTokens).toBe(50);
      expect(config.respectSectionBoundaries).toBe(true);
    });

    it('should accept custom config', () => {
      const customService = new ChunkingService({ minTokens: 200, maxTokens: 600 });
      const config = customService.getConfig();
      expect(config.minTokens).toBe(200);
      expect(config.maxTokens).toBe(600);
    });
  });

  describe('chunkDocument', () => {
    it('should return EMPTY_DOCUMENT error for null parsedPdf', () => {
      const result = service.chunkDocument({ bookId: 'test', parsedPdf: null as any });
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMPTY_DOCUMENT');
    });

    it('should return NO_TEXT_CONTENT error for empty text', () => {
      const pdf = createMockPDF({ fullText: '   ' });
      const result = service.chunkDocument({ bookId: 'test', parsedPdf: pdf });
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NO_TEXT_CONTENT');
    });

    it('should chunk simple text into single chunk if within limits', () => {
      const text = generateText(400); // ~400 tokens
      const pdf = createMockPDF({ fullText: text });
      const result = service.chunkDocument({ bookId: 'test', parsedPdf: pdf });
      expect(result.success).toBe(true);
      expect(result.chunks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('token counting', () => {
    it('should count tokens correctly', () => {
      expect(service.countTokens('')).toBe(0);
      expect(service.countTokens('hello')).toBeGreaterThan(0);
      expect(service.countTokens('hello world')).toBeGreaterThan(service.countTokens('hello'));
    });
  });

  describe('chunk properties', () => {
    it('should generate unique hashes for different text', () => {
      const text1 = generateText(400);
      const text2 = text1 + ' extra';
      const pdf1 = createMockPDF({ fullText: text1 });
      const pdf2 = createMockPDF({ fullText: text2 });
      const result1 = service.chunkDocument({ bookId: 'test1', parsedPdf: pdf1 });
      const result2 = service.chunkDocument({ bookId: 'test2', parsedPdf: pdf2 });
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.chunks.length > 0 && result2.chunks.length > 0) {
        expect(result1.chunks[0].hash).not.toBe(result2.chunks[0].hash);
      }
    });

    it('should assign sequential sequence numbers', () => {
      const text = generateText(1500); // Should create multiple chunks
      const pdf = createMockPDF({ fullText: text });
      const result = service.chunkDocument({ bookId: 'test', parsedPdf: pdf });
      expect(result.success).toBe(true);
      for (let i = 0; i < result.chunks.length; i++) {
        expect(result.chunks[i].sequence).toBe(i);
      }
    });
  });

  describe('config methods', () => {
    it('should update config with setConfig', () => {
      service.setConfig({ minTokens: 250 });
      expect(service.getConfig().minTokens).toBe(250);
    });

    it('should return copy of config from getConfig', () => {
      const config1 = service.getConfig();
      const config2 = service.getConfig();
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('stats', () => {
    it('should return valid stats', () => {
      const text = generateText(500);
      const pdf = createMockPDF({ fullText: text });
      const result = service.chunkDocument({ bookId: 'test', parsedPdf: pdf });
      expect(result.success).toBe(true);
      expect(result.stats.totalChunks).toBe(result.chunks.length);
      expect(result.stats.paragraphsProcessed).toBeGreaterThanOrEqual(0);
    });
  });
});
