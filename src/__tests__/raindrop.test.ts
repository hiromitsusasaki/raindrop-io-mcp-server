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

  describe("getBookmark", () => {
    it("gets a bookmark by ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            item: {
              _id: 123,
              title: "Example Bookmark",
              link: "https://example.com",
              tags: ["test"],
              created: "2024-03-21T00:00:00Z",
              lastUpdate: "2024-03-21T00:00:00Z",
              excerpt: "Example excerpt",
              type: "link",
              domain: "example.com",
            },
          }),
      } as Response);

      const result = await api.getBookmark(123);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.raindrop.io/rest/v1/raindrop/123",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
        },
      );
      expect(result).toEqual({
        item: {
          _id: 123,
          title: "Example Bookmark",
          link: "https://example.com",
          tags: ["test"],
          created: "2024-03-21T00:00:00Z",
          lastUpdate: "2024-03-21T00:00:00Z",
          excerpt: "Example excerpt",
          type: "link",
          domain: "example.com",
        },
      });
    });

    it("handles API errors for get operation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
        json: () => Promise.resolve({ error: "Bookmark not found" }),
      } as Response);

      await expect(api.getBookmark(999)).rejects.toThrow("Raindrop API error: Not Found");
    });
  });
});
