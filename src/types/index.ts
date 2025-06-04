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

export const GetBookmarkSchema = z.object({
  id: z.number(),
});

// Zodスキーマから型を生成
export type CreateBookmarkParams = z.infer<typeof CreateBookmarkSchema>;
export type SearchBookmarksParams = z.infer<typeof SearchBookmarksSchema>;
export type GetBookmarkParams = z.infer<typeof GetBookmarkSchema>;

// APIレスポンスの型
export interface RaindropItem {
  _id: number;
  title: string;
  link: string;
  tags?: string[];
  created: string;
  lastUpdate: string;
  excerpt?: string;
  note?: string;
  type?: string;
  cover?: string;
  collection?: {
    $id: number;
    title?: string;
  };
  domain?: string;
  user?: {
    $id: number;
  };
}

export interface BookmarkResponse {
  item: RaindropItem;
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
