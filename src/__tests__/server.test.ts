import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { RaindropAPI } from "../lib/raindrop-api.js";
import {
  CreateBookmarkSchema,
  SearchBookmarksSchema,
  CreateCollectionSchema,
  UpdateCollectionSchema,
  DeleteCollectionSchema,
  GetCollectionSchema,
} from "../types/index.js";

// モックのfetch関数
const mockFetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }),
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
        }),
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
        }),
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
---`,
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
        }),
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
        }),
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
        }),
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
        expect.any(Object),
      );
    });

    it("should filter by tags", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResults),
        }),
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
        expect.any(Object),
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
---`,
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
        }),
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
        }),
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

  describe("create-collection", () => {
    const handler = async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      if (name !== "create-collection") throw new Error("Invalid tool");

      const { title, description, parent, view, sort, public: isPublic } =
        CreateCollectionSchema.parse(args);

      const collectionData: any = { title };
      if (description) collectionData.description = description;
      if (parent) collectionData.parent = { $id: parent };
      if (view) collectionData.view = view;
      if (sort !== undefined) collectionData.sort = sort;
      if (isPublic !== undefined) collectionData.public = isPublic;

      const result = await api.createCollection(collectionData);

      return {
        content: [
          {
            type: "text",
            text: `Collection created successfully: "${result.item.title}" (ID: ${result.item._id})`,
          },
        ],
      };
    };

    it("should create a collection with minimal data", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ item: { _id: 123, title: "New Collection" } }),
        }),
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "create-collection",
          arguments: {
            title: "New Collection",
          },
        },
      });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: 'Collection created successfully: "New Collection" (ID: 123)',
          },
        ],
      });
    });

    it("should create a collection with all optional fields", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ item: { _id: 456, title: "Complete Collection" } }),
        }),
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "create-collection",
          arguments: {
            title: "Complete Collection",
            description: "A test collection",
            parent: 123,
            view: "grid",
            sort: 1,
            public: true,
          },
        },
      });

      expect(result.content[0].text).toContain(
        'Collection created successfully: "Complete Collection" (ID: 456)',
      );
    });

    it("should handle validation errors", async () => {
      await expect(
        handler({
          method: "tools/call",
          params: {
            name: "create-collection",
            arguments: {
              title: "",
            },
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe("update-collection", () => {
    const handler = async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      if (name !== "update-collection") throw new Error("Invalid tool");

      const {
        collectionId,
        title,
        description,
        parent,
        view,
        sort,
        public: isPublic,
      } = UpdateCollectionSchema.parse(args);

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (parent !== undefined) updateData.parent = { $id: parent };
      if (view) updateData.view = view;
      if (sort !== undefined) updateData.sort = sort;
      if (isPublic !== undefined) updateData.public = isPublic;

      const result = await api.updateCollection(collectionId, updateData);

      return {
        content: [
          {
            type: "text",
            text: `Collection updated successfully: "${result.item.title}" (ID: ${result.item._id})`,
          },
        ],
      };
    };

    it("should update a collection", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ item: { _id: 123, title: "Updated Collection" } }),
        }),
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "update-collection",
          arguments: {
            collectionId: 123,
            title: "Updated Collection",
            description: "Updated description",
          },
        },
      });

      expect(result.content[0].text).toContain(
        'Collection updated successfully: "Updated Collection" (ID: 123)',
      );
    });

    it("should handle missing collectionId", async () => {
      await expect(
        handler({
          method: "tools/call",
          params: {
            name: "update-collection",
            arguments: {
              title: "Test",
            },
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe("delete-collection", () => {
    const handler = async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      if (name !== "delete-collection") throw new Error("Invalid tool");

      const { collectionId } = DeleteCollectionSchema.parse(args);
      const result = await api.deleteCollection(collectionId);

      return {
        content: [
          {
            type: "text",
            text: result.result
              ? `Collection deleted successfully (ID: ${collectionId})`
              : `Failed to delete collection (ID: ${collectionId})`,
          },
        ],
      };
    };

    it("should delete a collection successfully", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: true }),
        }),
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "delete-collection",
          arguments: {
            collectionId: 123,
          },
        },
      });

      expect(result.content[0].text).toBe("Collection deleted successfully (ID: 123)");
    });

    it("should handle deletion failure", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: false }),
        }),
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "delete-collection",
          arguments: {
            collectionId: 123,
          },
        },
      });

      expect(result.content[0].text).toBe("Failed to delete collection (ID: 123)");
    });
  });

  describe("get-collection", () => {
    const handler = async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      if (name !== "get-collection") throw new Error("Invalid tool");

      const { collectionId } = GetCollectionSchema.parse(args);
      const result = await api.getCollection(collectionId);
      const collection = result.item;

      const formattedCollection = `
Name: ${collection.title}
ID: ${collection._id}
Description: ${collection.description || "No description"}
Count: ${collection.count} bookmarks
View: ${collection.view || "Not set"}
Sort: ${collection.sort !== undefined ? collection.sort : "Not set"}
Public: ${collection.public !== undefined ? collection.public : "Not set"}
Parent: ${collection.parent?._id || "None"}
Created: ${new Date(collection.created).toLocaleString()}
Last Update: ${collection.lastUpdate ? new Date(collection.lastUpdate).toLocaleString() : "Never"}
Access Level: ${collection.access?.level || "Not available"}
`;

      return {
        content: [
          {
            type: "text",
            text: formattedCollection,
          },
        ],
      };
    };

    it("should get collection details", async () => {
      const mockCollection = {
        _id: 123,
        title: "Test Collection",
        description: "A test collection",
        count: 5,
        created: "2024-03-21T00:00:00Z",
        lastUpdate: "2024-03-22T00:00:00Z",
        view: "list",
        sort: 0,
        public: false,
        access: { level: 4, draggable: true },
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ item: mockCollection }),
        }),
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "get-collection",
          arguments: {
            collectionId: 123,
          },
        },
      });

      expect(result.content[0].text).toContain("Test Collection");
      expect(result.content[0].text).toContain("A test collection");
      expect(result.content[0].text).toContain("5 bookmarks");
      expect(result.content[0].text).toContain("list");
      expect(result.content[0].text).toContain("false");
    });

    it("should handle collection with minimal data", async () => {
      const mockCollection = {
        _id: 456,
        title: "Minimal Collection",
        count: 0,
        created: "2024-03-21T00:00:00Z",
      };

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ item: mockCollection }),
        }),
      );

      const result = await handler({
        method: "tools/call",
        params: {
          name: "get-collection",
          arguments: {
            collectionId: 456,
          },
        },
      });

      expect(result.content[0].text).toContain("Minimal Collection");
      expect(result.content[0].text).toContain("No description");
      expect(result.content[0].text).toContain("Not set");
      expect(result.content[0].text).toContain("Never");
    });
  });
});
