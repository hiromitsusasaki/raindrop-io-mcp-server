import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { RaindropAPI } from "../lib/raindrop-api.js";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("RaindropAPI", () => {
  let api: RaindropAPI;

  beforeEach(() => {
    mockFetch.mockReset();
    api = new RaindropAPI("test-token");
  });

  describe("createBookmark", () => {
    it("creates a bookmark", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: { _id: 123 } }),
      } as Response);

      const result = await api.createBookmark({
        link: "https://example.com",
        title: "Example",
        tags: ["test"],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/raindrop",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
          body: JSON.stringify({
            link: "https://example.com",
            title: "Example",
            tags: ["test"],
          }),
        },
      );
      expect(result).toEqual({ item: { _id: 123 } });
    });

    it("handles API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Invalid token",
        json: () => Promise.resolve({ error: "Invalid token" }),
      } as Response);

      await expect(
        api.createBookmark({
          link: "https://example.com",
          title: "Example",
          tags: ["test"],
        }),
      ).rejects.toThrow("Raindrop API error: Invalid token");
    });
  });

  describe("searchBookmarks", () => {
    it("searches bookmarks", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                title: "Example",
                link: "https://example.com",
                tags: ["test"],
                created: "2024-03-21T00:00:00Z",
                lastUpdate: "2024-03-21T00:00:00Z",
              },
            ],
            count: 1,
          }),
      } as Response);

      const result = await api.searchBookmarks(
        0,
        new URLSearchParams({ search: "test" }),
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/raindrops/0?search=test",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
        },
      );
      expect(result).toEqual({
        items: [
          {
            title: "Example",
            link: "https://example.com",
            tags: ["test"],
            created: "2024-03-21T00:00:00Z",
            lastUpdate: "2024-03-21T00:00:00Z",
          },
        ],
        count: 1,
      });
    });
  });

  describe("listCollections", () => {
    it("lists collections", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                title: "Test Collection",
                _id: 123,
                count: 1,
                created: "2024-03-21T00:00:00Z",
              },
            ],
          }),
      } as Response);

      const result = await api.listCollections();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/collections",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
        },
      );
      expect(result).toEqual({
        items: [
          {
            title: "Test Collection",
            _id: 123,
            count: 1,
            created: "2024-03-21T00:00:00Z",
          },
        ],
      });
    });
  });

  describe("createCollection", () => {
    it("creates a collection with minimal data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: { _id: 456, title: "New Collection" } }),
      } as Response);

      const result = await api.createCollection({
        title: "New Collection",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/collection",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
          body: JSON.stringify({
            title: "New Collection",
          }),
        },
      );
      expect(result).toEqual({ item: { _id: 456, title: "New Collection" } });
    });

    it("creates a collection with all optional fields", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: { _id: 789, title: "Complete Collection" } }),
      } as Response);

      const result = await api.createCollection({
        title: "Complete Collection",
        description: "A test collection",
        parent: { $id: 123 },
        view: "grid",
        sort: 1,
        public: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/collection",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
          body: JSON.stringify({
            title: "Complete Collection",
            description: "A test collection",
            parent: { $id: 123 },
            view: "grid",
            sort: 1,
            public: true,
          }),
        },
      );
      expect(result).toEqual({ item: { _id: 789, title: "Complete Collection" } });
    });
  });

  describe("updateCollection", () => {
    it("updates a collection", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: { _id: 123, title: "Updated Collection" } }),
      } as Response);

      const result = await api.updateCollection(123, {
        title: "Updated Collection",
        description: "Updated description",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/collection/123",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
          body: JSON.stringify({
            title: "Updated Collection",
            description: "Updated description",
          }),
        },
      );
      expect(result).toEqual({ item: { _id: 123, title: "Updated Collection" } });
    });

    it("handles API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Collection not found",
        json: () => Promise.resolve({ error: "Collection not found" }),
      } as Response);

      await expect(
        api.updateCollection(999, { title: "Non-existent" })
      ).rejects.toThrow("Raindrop API error: Collection not found");
    });
  });

  describe("deleteCollection", () => {
    it("deletes a collection", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: true }),
      } as Response);

      const result = await api.deleteCollection(123);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/collection/123",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
        },
      );
      expect(result).toEqual({ result: true });
    });

    it("handles deletion failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: false }),
      } as Response);

      const result = await api.deleteCollection(123);
      expect(result).toEqual({ result: false });
    });
  });

  describe("getCollection", () => {
    it("gets collection details", async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: mockCollection }),
      } as Response);

      const result = await api.getCollection(123);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/collection/123",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
        },
      );
      expect(result).toEqual({ item: mockCollection });
    });

    it("handles collection not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
        json: () => Promise.resolve({ error: "Collection not found" }),
      } as Response);

      await expect(
        api.getCollection(999)
      ).rejects.toThrow("Raindrop API error: Not Found");
    });
  });
});
