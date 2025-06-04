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
    name: "create-highlight",
    description: "Create a new highlight for a bookmark in Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        raindropId: {
          type: "number",
          description: "ID of the bookmark/raindrop to highlight",
        },
        text: {
          type: "string",
          description: "The text to highlight",
        },
        note: {
          type: "string",
          description: "Optional note for the highlight",
        },
        color: {
          type: "string",
          description:
            "Color of the highlight (e.g., yellow, blue, green, red)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for the highlight (optional)",
        },
      },
      required: ["raindropId", "text"],
    },
  },
  {
    name: "list-highlights",
    description: "List highlights from Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        raindropId: {
          type: "number",
          description:
            "ID of specific bookmark to get highlights from (optional)",
        },
        page: {
          type: "number",
          description: "Page number (0-based, optional)",
        },
        perpage: {
          type: "number",
          description: "Items per page (1-50, optional)",
        },
      },
    },
  },
  {
    name: "update-highlight",
    description: "Update an existing highlight in Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        highlightId: {
          type: "string",
          description: "ID of the highlight to update",
        },
        text: {
          type: "string",
          description: "Updated text for the highlight",
        },
        note: {
          type: "string",
          description: "Updated note for the highlight",
        },
        color: {
          type: "string",
          description:
            "Updated color of the highlight (e.g., yellow, blue, green, red)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Updated tags for the highlight",
        },
      },
      required: ["highlightId"],
    },
  },
  {
    name: "delete-highlight",
    description: "Delete a highlight from Raindrop.io",
    inputSchema: {
      type: "object",
      properties: {
        highlightId: {
          type: "string",
          description: "ID of the highlight to delete",
        },
      },
      required: ["highlightId"],
    },
  },
];
