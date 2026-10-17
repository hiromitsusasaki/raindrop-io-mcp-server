# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run build` - Compile TypeScript to JavaScript in the build/ directory
- `npm start` - Run the built MCP server (requires prior build)
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- Run specific test: `npm test -- --testNamePattern="pattern"`
- Run tests for specific file: `npm test src/__tests__/raindrop.test.ts`

## Architecture

This is a Model Context Protocol (MCP) server that provides LLMs with access to Raindrop.io bookmark management. The server uses stdio transport to communicate with MCP clients like Claude Desktop.

### Core Components

- **src/index.ts** - Main MCP server entry point that handles tool registration and execution
- **src/lib/raindrop-api.ts** - HTTP client wrapper for Raindrop.io REST API
- **src/lib/tools.ts** - Tool definitions exported to MCP clients
- **src/types/index.ts** - TypeScript type definitions and Zod schemas

### MCP Tools Available

1. **create-bookmark** - Creates bookmarks with URL, title, tags, and collection
2. **search-bookmarks** - Searches bookmarks with query, tag filtering, pagination, and sorting
3. **list-collections** - Lists all user collections

### Key Technical Details

- Uses ES modules (Node16 module resolution)
- Requires RAINDROP_TOKEN environment variable
- API communication uses Bearer token authentication
- Built on @modelcontextprotocol/sdk framework
- Input validation with Zod schemas
- TypeScript with strict mode enabled

### Environment Setup

The server requires a Raindrop.io API token set as `RAINDROP_TOKEN` environment variable. When working with this codebase, create a `.env` file for local development or ensure the environment variable is available when running tests that interact with the API.