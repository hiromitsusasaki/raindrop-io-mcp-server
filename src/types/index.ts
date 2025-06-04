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

export const ListTagsSchema = z.object({});

export const MergeTagsSchema = z.object({
  tags: z.array(z.string()).min(2, "At least 2 tags are required for merging"),
  new_name: z.string().min(1, "New tag name is required"),
});

export const DeleteTagSchema = z.object({
  tag: z.string().min(1, "Tag name is required"),
});

// Zodスキーマから型を生成
export type CreateBookmarkParams = z.infer<typeof CreateBookmarkSchema>;
export type SearchBookmarksParams = z.infer<typeof SearchBookmarksSchema>;
export type ListTagsParams = z.infer<typeof ListTagsSchema>;
export type MergeTagsParams = z.infer<typeof MergeTagsSchema>;
export type DeleteTagParams = z.infer<typeof DeleteTagSchema>;

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

export interface Tag {
  _id: string;
  name: string;
  count: number;
}

export interface TagsResponse {
  items: Tag[];
}
