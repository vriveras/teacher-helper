import { z } from 'zod';

export const licensePolicySchema = z.object({
  maxExcerptLength: z.number().min(0),
  allowWatermark: z.boolean(),
  usageLogging: z.boolean(),
});

export const tocEntrySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    level: z.number().min(0),
    pageStart: z.number().optional(),
    pageEnd: z.number().optional(),
    children: z.array(tocEntrySchema).optional(),
  })
);

export const bookSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  edition: z.string().optional(),
  subject: z.string().min(1),
  gradeBand: z.string().min(1),
  language: z.string().min(1),
  licensePolicy: licensePolicySchema,
  toc: z.array(tocEntrySchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const chunkSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  chapter: z.string().optional(),
  section: z.string().optional(),
  pageStart: z.number().optional(),
  pageEnd: z.number().optional(),
  text: z.string().min(1),
  embedding: z.array(z.number()).optional(),
  hash: z.string(),
  createdAt: z.date(),
});

export type BookInput = z.infer<typeof bookSchema>;
export type ChunkInput = z.infer<typeof chunkSchema>;
