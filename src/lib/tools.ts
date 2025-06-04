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
  {
    name: "create-collection",
    description: "Create a new collection in Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title for the collection",
        },
        description: {
          type: "string",
          description: "Description for the collection (optional)",
        },
        parent: {
          type: "number",
          description: "Parent collection ID for nested collections (optional)",
        },
        view: {
          type: "string",
          enum: ["list", "simple", "grid", "masonry"],
          description: "View type for the collection (optional)",
        },
        sort: {
          type: "number",
          minimum: 0,
          maximum: 4,
          description: "Sort order (0-4, optional)",
        },
        public: {
          type: "boolean",
          description: "Whether the collection is public (optional)",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "update-collection",
    description: "Update an existing collection in Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        collectionId: {
          type: "number",
          description: "ID of the collection to update",
        },
        title: {
          type: "string",
          description: "New title for the collection (optional)",
        },
        description: {
          type: "string",
          description: "New description for the collection (optional)",
        },
        parent: {
          type: "number",
          description: "New parent collection ID (optional)",
        },
        view: {
          type: "string",
          enum: ["list", "simple", "grid", "masonry"],
          description: "New view type for the collection (optional)",
        },
        sort: {
          type: "number",
          minimum: 0,
          maximum: 4,
          description: "New sort order (0-4, optional)",
        },
        public: {
          type: "boolean",
          description: "Whether the collection is public (optional)",
        },
      },
      required: ["collectionId"],
    },
  },
  {
    name: "delete-collection",
    description: "Delete a collection from Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        collectionId: {
          type: "number",
          description: "ID of the collection to delete",
        },
      },
      required: ["collectionId"],
    },
  },
  {
    name: "get-collection",
    description: "Get detailed information about a specific collection",
    inputSchema: {
      type: "object",
      properties: {
        collectionId: {
          type: "number",
          description: "ID of the collection to retrieve",
        },
      },
      required: ["collectionId"],
    },
  },
];
