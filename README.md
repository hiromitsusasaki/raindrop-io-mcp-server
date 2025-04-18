# Raindrop.io MCP Server
[![smithery badge](https://smithery.ai/badge/@hiromitsusasaki/raindrop-io-mcp-server)](https://smithery.ai/server/@hiromitsusasaki/raindrop-io-mcp-server)

An integration that allows LLMs to interact with Raindrop.io bookmarks using the Model Context Protocol (MCP).

## Features

- Create bookmarks
- Search bookmarks
- Filter by tags

## Requirements

- Node.js 16 or higher
- Raindrop.io account and API token

## Setup

### Installing via Smithery

To install Raindrop.io Integration for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@hiromitsusasaki/raindrop-io-mcp-server):

```bash
npx -y @smithery/cli install @hiromitsusasaki/raindrop-io-mcp-server --client claude
```

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/hiromitsusasaki/raindrop-io-mcp-server
cd raindrop-io-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Create a `.env` file and set your Raindrop.io API token
```
RAINDROP_TOKEN=your_access_token_here
```

4. Build:
```bash
npm run build
```

## Using with Claude for Desktop

1. Open Claude for Desktop configuration file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following configuration:
```json
{
  "mcpServers": {
    "raindrop": {
      "command": "node",
      "args": ["PATH_TO_BUILD/index.js"],
      "env": {
        "RAINDROP_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

3. Restart Claude for Desktop

## Available Tools

### create-bookmark
Creates a new bookmark.

**Parameters:**
- `url`: URL to bookmark (required)
- `title`: Title for the bookmark (optional)
- `tags`: Array of tags (optional)
- `collection`: Collection ID (optional)

### search-bookmarks
Searches through bookmarks.

**Parameters:**
- `query`: Search query (required)
- `tags`: Array of tags to filter by (optional)

## Development

```bash
# Build for development
npm run build

# Start server
npm start
```

## Security Notes

- Always manage API tokens using environment variables
- Set appropriate permissions for Claude for Desktop configuration files
- Restrict unnecessary file access

## Open Source

This is an open source MCP server that anyone can use and contribute to. The project is released under the MIT License.

## Contributing

Contributions are welcome! Feel free to submit issues, feature requests, or pull requests to help improve this project.


## Related Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Raindrop.io API Documentation](https://developer.raindrop.io/)
