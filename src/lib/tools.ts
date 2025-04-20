import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const tools: Tool[] = [
  {
    name: "create-bookmark",
    description: "Create a new bookmark in Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to bookmark",
        },
        title: {
          type: "string",
          description: "Title for the bookmark (optional)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for the bookmark (optional)",
        },
        collection: {
          type: "number",
          description: "Collection ID to save to (optional)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "search-bookmarks",
    description: "Search through your Raindrop.io bookmarks",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter by tags (optional)",
        },
        page: {
          type: "number",
          description: "Page number (0-based, optional)",
        },
        perpage: {
          type: "number",
          description: "Items per page (1-50, optional)",
        },
        sort: {
          type: "string",
          enum: [
            "-created",
            "created",
            "-last_update",
            "last_update",
            "-title",
            "title",
            "-domain",
            "domain",
          ],
          description:
            "Sort order (optional). Prefix with - for descending order.",
        },
        collection: {
          type: "number",
          description:
            "Collection ID to search in (optional, 0 for all collections)",
        },
        word: {
          type: "boolean",
          description: "Whether to match exact words only (optional)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list-collections",
    description: "List all your Raindrop.io collections",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
