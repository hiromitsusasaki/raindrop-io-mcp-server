import { describe, expect, it, jest } from "@jest/globals";
import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { RaindropAPI } from "../lib/raindrop-api.js";
import { CreateBookmarkSchema, SearchBookmarksSchema } from "../types/index.js";

// モックのfetch関数
const mockFetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);
global.fetch = mockFetch as unknown as typeof fetch;

describe("Tool Handlers", () => {
  const api = new RaindropAPI("test-token");

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("create-bookmark", () => {
    const handler = async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      if (name !== "create-bookmark") throw new Error("Invalid tool");

      const { url, title, tags, collection } = CreateBookmarkSchema.parse(args);
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
            text: `Bookmark created successfully: ${bookmark.item?.link || url}`,
          },
        ],
      };
    };

    it("should create a bookmark with required fields", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ item: { link: "https://example.com" } }),
        })
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "create-bookmark",
          arguments: {
            url: "https://example.com",
          },
        },
      });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Bookmark created successfully: https://example.com",
          },
        ],
      });
    });

    it("should handle validation errors", async () => {
      await expect(
        handler({
          method: "tools/call",
          params: {
            name: "create-bookmark",
            arguments: {
              url: "invalid-url",
            },
          },
        })
      ).rejects.toThrow("Invalid");
    });
  });

  describe("search-bookmarks", () => {
    const handler = async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      if (name !== "search-bookmarks") throw new Error("Invalid tool");

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

      return {
        content: [
          {
            type: "text",
            text:
              results.items.length > 0
                ? `Found ${results.count} total bookmarks (showing ${
                    results.items.length
                  } on page ${page ?? 0 + 1}):\n${results.items
                    .map(
                      (item) => `
Title: ${item.title}
URL: ${item.link}
Tags: ${item.tags?.length ? item.tags.join(", ") : "No tags"}
Created: ${new Date(item.created).toLocaleString()}
Last Updated: ${new Date(item.lastUpdate).toLocaleString()}
---`
                    )
                    .join("\n")}`
                : "No bookmarks found matching your search.",
          },
        ],
      };
    };

    const mockSearchResults = {
      items: [
        {
          title: "Test Bookmark",
          link: "https://example.com",
          tags: ["test", "example"],
          created: "2024-03-20T00:00:00.000Z",
          lastUpdate: "2024-03-20T00:00:00.000Z",
        },
      ],
      count: 1,
    };

    it("should search bookmarks with query", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResults),
        })
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "search-bookmarks",
          arguments: {
            query: "test",
          },
        },
      });

      expect(result.content[0].text).toContain("Found 1 total bookmarks");
      expect(result.content[0].text).toContain("Test Bookmark");
    });

    it("should handle pagination", async () => {
      const paginatedResults = {
        ...mockSearchResults,
        count: 30,
        items: Array(10).fill(mockSearchResults.items[0]),
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(paginatedResults),
        })
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "search-bookmarks",
          arguments: {
            query: "test",
            page: 1,
            perpage: 10,
          },
        },
      });

      expect(result.content[0].text).toContain("Found 30 total bookmarks");
      expect(result.content[0].text).toContain("showing 10");
    });

    it("should apply sorting", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResults),
        })
      );

      await handler({
        method: "tools/call",
        params: {
          name: "search-bookmarks",
          arguments: {
            query: "test",
            sort: "-created",
          },
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("sort=-created"),
        expect.any(Object)
      );
    });

    it("should filter by tags", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResults),
        })
      );

      await handler({
        method: "tools/call",
        params: {
          name: "search-bookmarks",
          arguments: {
            query: "test",
            tags: ["example", "test"],
          },
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tags=example%2Ctest"),
        expect.any(Object)
      );
    });
  });

  describe("list-collections", () => {
    const handler = async (request: CallToolRequest) => {
      const { name } = request.params;
      if (name !== "list-collections") throw new Error("Invalid tool");

      const collections = await api.listCollections();

      return {
        content: [
          {
            type: "text",
            text:
              collections.items.length > 0
                ? `Found ${collections.items.length} collections:\n${collections.items
                    .map(
                      (item) => `
Name: ${item.title}
ID: ${item._id}
Count: ${item.count} bookmarks
Parent: ${item.parent?._id || "None"}
Created: ${new Date(item.created).toLocaleString()}
---`
                    )
                    .join("\n")}`
                : "No collections found.",
          },
        ],
      };
    };

    const mockCollections = {
      items: [
        {
          title: "Test Collection",
          _id: 1,
          count: 5,
          created: "2024-03-20T00:00:00.000Z",
        },
      ],
    };

    it("should list all collections", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCollections),
        })
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "list-collections",
          arguments: {},
        },
      });

      expect(result.content[0].text).toContain("Found 1 collections");
      expect(result.content[0].text).toContain("Test Collection");
    });

    it("should handle empty collections", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        })
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "list-collections",
          arguments: {},
        },
      });

      expect(result.content[0].text).toBe("No collections found.");
    });
  });
});
