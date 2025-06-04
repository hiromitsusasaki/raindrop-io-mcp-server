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

export const CreateCollectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  parent: z.number().optional(),
  view: z.enum(["list", "simple", "grid", "masonry"]).optional(),
  sort: z.number().min(0).max(4).optional(),
  public: z.boolean().optional(),
});

export const UpdateCollectionSchema = z.object({
  collectionId: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  parent: z.number().optional(),
  view: z.enum(["list", "simple", "grid", "masonry"]).optional(),
  sort: z.number().min(0).max(4).optional(),
  public: z.boolean().optional(),
});

export const DeleteCollectionSchema = z.object({
  collectionId: z.number(),
});

export const GetCollectionSchema = z.object({
  collectionId: z.number(),
});

// Zodスキーマから型を生成
export type CreateBookmarkParams = z.infer<typeof CreateBookmarkSchema>;
export type SearchBookmarksParams = z.infer<typeof SearchBookmarksSchema>;
export type CreateCollectionParams = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionParams = z.infer<typeof UpdateCollectionSchema>;
export type DeleteCollectionParams = z.infer<typeof DeleteCollectionSchema>;
export type GetCollectionParams = z.infer<typeof GetCollectionSchema>;

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
  description?: string;
  count: number;
  created: string;
  lastUpdate?: string;
  parent?: { _id: number };
  view?: string;
  sort?: number;
  public?: boolean;
  user?: { _id: number };
  access?: {
    level: number;
    draggable: boolean;
  };
}

export interface SearchResponse {
  items: RaindropItem[];
  count: number;
}

export interface CollectionsResponse {
  items: Collection[];
}
