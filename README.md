# mcp-ecosystems

ecosyste.ms Packages MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_package` | Get a package's open metadata from ecosyste.ms — description, homepage, repository, license, latest version, monthly downloads, and dependent/usage counts. Works across 100+ registries. Keyless. |
| `lookup_package` | Look up every registry a package or repository is published to, via package URL (purl) or repository URL. Returns matching package records across all registries. Keyless. |
| `list_registries` | List the package registries ecosyste.ms supports (npm, PyPI, crates.io, Go, NuGet, Maven, RubyGems, Packagist, Docker Hub, and 100+ more) with their ecosystem and package counts. Keyless. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ecosystems": {
      "url": "https://gateway.pipeworx.io/ecosystems/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ecosystems data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
