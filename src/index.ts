import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { z } from "zod";
import { RaindropAPI } from "./lib/raindrop-api.js";
import { tools } from "./lib/tools.js";
import { 
  CreateBookmarkSchema, 
  SearchBookmarksSchema, 
  ListTagsSchema, 
  MergeTagsSchema, 
  DeleteTagSchema 
} from "./types/index.js";

dotenv.config();

const server = new Server(
  {
    name: "raindrop-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// ツール一覧の定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// ツール実行のハンドリング
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;
    const token = process.env.RAINDROP_TOKEN;
    if (!token) {
      throw new Error("RAINDROP_TOKEN is not set");
    }

    const api = new RaindropAPI(token);

    try {
      if (name === "create-bookmark") {
        const { url, title, tags, collection } =
          CreateBookmarkSchema.parse(args);

        const bookmark = await api.createBookmark({
          link: url,
          title,
          tags,
          collection: { $id: collection || 0 },
        });

        return {
          content: [
            {
              type: "text",
              text: `Bookmark created successfully: ${bookmark.item.link}`,
            },
          ],
        };
      }

      if (name === "search-bookmarks") {
        const { query, tags, page, perpage, sort, collection, word } =
          SearchBookmarksSchema.parse(args);

        const searchParams = new URLSearchParams({
          search: query,
          ...(tags && { tags: tags.join(",") }),
          ...(page !== undefined && { page: page.toString() }),
          ...(perpage !== undefined && { perpage: perpage.toString() }),
          ...(sort && { sort }),
          ...(word !== undefined && { word: word.toString() }),
        });

        const collectionId = collection ?? 0;
        const results = await api.searchBookmarks(collectionId, searchParams);

        const formattedResults = results.items
          .map(
            (item) => `
Title: ${item.title}
URL: ${item.link}
Tags: ${item.tags?.length ? item.tags.join(", ") : "No tags"}
Created: ${new Date(item.created).toLocaleString()}
Last Updated: ${new Date(item.lastUpdate).toLocaleString()}
---`,
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text:
                results.items.length > 0
                  ? `Found ${results.count} total bookmarks (showing ${
                      results.items.length
                    } on page ${page ?? 0 + 1}):\n${formattedResults}`
                  : "No bookmarks found matching your search.",
            },
          ],
        };
      }

      if (name === "list-collections") {
        const collections = await api.listCollections();

        const formattedCollections = collections.items
          .map(
            (item) => `
Name: ${item.title}
ID: ${item._id}
Count: ${item.count} bookmarks
Parent: ${item.parent?._id || "None"}
Created: ${new Date(item.created).toLocaleString()}
---`,
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text:
                collections.items.length > 0
                  ? `Found ${collections.items.length} collections:\n${formattedCollections}`
                  : "No collections found.",
            },
          ],
        };
      }

      if (name === "list-tags") {
        ListTagsSchema.parse(args);
        const tags = await api.listTags();

        const formattedTags = tags.items
          .map(
            (tag) => `
Name: ${tag.name}
Usage Count: ${tag.count}
---`,
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text:
                tags.items.length > 0
                  ? `Found ${tags.items.length} tags:\n${formattedTags}`
                  : "No tags found.",
            },
          ],
        };
      }

      if (name === "merge-tags") {
        const { tags, new_name } = MergeTagsSchema.parse(args);
        const result = await api.mergeTags(tags, new_name);

        return {
          content: [
            {
              type: "text",
              text: result.result
                ? `Successfully merged tags [${tags.join(", ")}] into "${new_name}"`
                : "Failed to merge tags. Please check if the tags exist.",
            },
          ],
        };
      }

      if (name === "delete-tag") {
        const { tag } = DeleteTagSchema.parse(args);
        const result = await api.deleteTag(tag);

        return {
          content: [
            {
              type: "text",
              text: result.result
                ? `Successfully deleted tag "${tag}"`
                : `Failed to delete tag "${tag}". Please check if the tag exists.`,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid arguments: ${error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`,
        );
      }
      throw error;
    }
  },
);

// サーバー起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Raindrop MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
