export interface Book {
  id: string;
  title: string;
  edition?: string;
  subject: string;
  gradeBand: string;
  language: string;
  licensePolicy: LicensePolicy;
  toc: TableOfContentsEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TableOfContentsEntry {
  id: string;
  title: string;
  level: number;
  pageStart?: number;
  pageEnd?: number;
  children?: TableOfContentsEntry[];
}

export interface LicensePolicy {
  maxExcerptLength: number;
  allowWatermark: boolean;
  usageLogging: boolean;
}

export interface Chunk {
  id: string;
  bookId: string;
  chapter?: string;
  section?: string;
  pageStart?: number;
  pageEnd?: number;
  text: string;
  embedding?: number[];
  hash: string;
  createdAt: Date;
}
