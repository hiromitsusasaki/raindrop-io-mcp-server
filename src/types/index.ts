import { z } from "zod";

// バリデーションスキーマ
export const CreateBookmarkSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  collection: z.number().optional(),
});

export const SearchBookmarksSchema = z.object({
  query: z.string(),
  tags: z.array(z.string()).optional(),
  page: z.number().min(0).optional(),
  perpage: z.number().min(1).max(50).optional(),
  sort: z
    .enum([
      "-created",
      "created",
      "-last_update",
      "last_update",
      "-title",
      "title",
      "-domain",
      "domain",
    ])
    .optional(),
  collection: z.number().optional(),
  word: z.boolean().optional(),
});

// Zodスキーマから型を生成
export type CreateBookmarkParams = z.infer<typeof CreateBookmarkSchema>;
export type SearchBookmarksParams = z.infer<typeof SearchBookmarksSchema>;

// APIレスポンスの型
export interface RaindropItem {
  title: string;
  link: string;
  tags?: string[];
  created: string;
  lastUpdate: string;
}

export interface Collection {
  _id: number;
  title: string;
  count: number;
  created: string;
  parent?: { _id: number };
}

export interface SearchResponse {
  items: RaindropItem[];
  count: number;
}

export interface CollectionsResponse {
  items: Collection[];
}

// Highlight types and schemas
export const CreateHighlightSchema = z.object({
  raindropId: z.number(),
  text: z.string(),
  note: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const ListHighlightsSchema = z.object({
  raindropId: z.number().optional(),
  page: z.number().min(0).optional(),
  perpage: z.number().min(1).max(50).optional(),
});

export const UpdateHighlightSchema = z.object({
  highlightId: z.string(),
  text: z.string().optional(),
  note: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const DeleteHighlightSchema = z.object({
  highlightId: z.string(),
});

export type CreateHighlightParams = z.infer<typeof CreateHighlightSchema>;
export type ListHighlightsParams = z.infer<typeof ListHighlightsSchema>;
export type UpdateHighlightParams = z.infer<typeof UpdateHighlightSchema>;
export type DeleteHighlightParams = z.infer<typeof DeleteHighlightSchema>;

export interface Highlight {
  _id: string;
  text: string;
  note?: string;
  color?: string;
  tags?: string[];
  created: string;
  lastUpdate: string;
  raindrop: {
    $id: number;
    title: string;
    link: string;
  };
}

export interface HighlightsResponse {
  items: Highlight[];
  count: number;
}
