/**
 * PDF Parser Types for TeacherHelper KB-Ingestion
 *
 * These types define the output structure for the PDF parsing service,
 * supporting the book upload -> chunk -> index pipeline.
 */

/**
 * Metadata extracted from a PDF document
 */
export interface PDFMetadata {
  /** Document title from PDF info dictionary */
  title?: string;
  /** Author name from PDF info dictionary */
  author?: string;
  /** Subject/description from PDF info dictionary */
  subject?: string;
  /** Keywords from PDF info dictionary */
  keywords?: string;
  /** PDF creator application */
  creator?: string;
  /** PDF producer application */
  producer?: string;
  /** Document creation date */
  creationDate?: Date;
  /** Document modification date */
  modificationDate?: Date;
  /** Total number of pages */
  pageCount: number;
  /** PDF version (e.g., "1.4", "1.7") */
  pdfVersion?: string;
  /** Whether the PDF is encrypted */
  isEncrypted?: boolean;
}

/**
 * Represents a single page from the PDF
 */
export interface PDFPage {
  /** 1-based page number */
  pageNumber: number;
  /** Raw text content of the page */
  text: string;
  /** Approximate character count */
  characterCount: number;
}

/**
 * A detected heading/section in the PDF
 */
export interface PDFHeading {
  /** Heading text */
  text: string;
  /** Heading level (1 = chapter/major, 2 = section, 3 = subsection, etc.) */
  level: number;
  /** Page number where the heading appears */
  pageNumber: number;
  /** Character position within the page text */
  position: number;
}

/**
 * A section of the document bounded by headings
 */
export interface PDFSection {
  /** Section heading text */
  heading?: string;
  /** Section level (1 = chapter, 2 = section, etc.) */
  level: number;
  /** Starting page number */
  pageStart: number;
  /** Ending page number */
  pageEnd: number;
  /** Text content of this section */
  text: string;
  /** Child sections (for hierarchical structure) */
  children?: PDFSection[];
}

/**
 * Complete parsed PDF document
 */
export interface ParsedPDF {
  /** Document metadata */
  metadata: PDFMetadata;
  /** Full text content of the document */
  fullText: string;
  /** Individual pages with their content */
  pages: PDFPage[];
  /** Detected headings/sections */
  headings: PDFHeading[];
  /** Hierarchical section structure (if detected) */
  sections: PDFSection[];
  /** Total character count */
  totalCharacters: number;
  /** Estimated word count */
  estimatedWordCount: number;
}

/**
 * Configuration options for PDF parsing
 */
export interface PDFParserOptions {
  /** Maximum number of pages to process (undefined = all pages) */
  maxPages?: number;
  /** Whether to attempt heading detection */
  detectHeadings?: boolean;
  /** Whether to preserve page boundaries in full text */
  preservePageBoundaries?: boolean;
  /** Custom heading patterns to detect (regex strings) */
  headingPatterns?: string[];
  /** Minimum heading text length to consider */
  minHeadingLength?: number;
  /** Maximum heading text length to consider */
  maxHeadingLength?: number;
}

/**
 * Default PDF parser options
 */
export const DEFAULT_PDF_PARSER_OPTIONS: PDFParserOptions = {
  maxPages: undefined,
  detectHeadings: true,
  preservePageBoundaries: true,
  headingPatterns: [
    // Common chapter patterns
    '^Chapter\s+\d+',
    '^CHAPTER\s+\d+',
    // Section patterns
    '^Section\s+\d+',
    '^SECTION\s+\d+',
    // Numbered headings
    '^\d+\.\s+[A-Z]',
    '^\d+\.\d+\s+[A-Z]',
    // All caps headings (likely titles)
    '^[A-Z][A-Z\s]{10,}$',
  ],
  minHeadingLength: 3,
  maxHeadingLength: 150,
};

/**
 * Result of a PDF parsing operation
 */
export interface PDFParseResult {
  /** Whether parsing was successful */
  success: boolean;
  /** Parsed document (if successful) */
  data?: ParsedPDF;
  /** Error information (if failed) */
  error?: PDFParseError;
}

/**
 * Error information from PDF parsing
 */
export interface PDFParseError {
  /** Error code for programmatic handling */
  code: PDFErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: string;
  /** Original error if wrapped */
  cause?: Error;
}

/**
 * Error codes for PDF parsing failures
 */
export type PDFErrorCode =
  | 'FILE_NOT_FOUND'
  | 'INVALID_PDF'
  | 'ENCRYPTED_PDF'
  | 'CORRUPTED_PDF'
  | 'EMPTY_PDF'
  | 'PARSE_ERROR'
  | 'MEMORY_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';
