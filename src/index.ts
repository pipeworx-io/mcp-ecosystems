interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ecosyste.ms Packages MCP.
 *
 * Open metadata for open-source packages across 100+ registries (npm, PyPI,
 * crates.io, Go, NuGet, Maven, RubyGems, Packagist, Docker Hub, etc.) with
 * cross-registry dependency and usage data. Keyless. A cross-registry
 * complement to deps.dev and individual registry packs.
 */


const BASE = 'https://packages.ecosyste.ms/api/v1';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_package',
    description:
      "Get a package's open metadata from ecosyste.ms — description, homepage, repository, license, latest version, monthly downloads, and dependent/usage counts. Works across 100+ registries. Keyless.",
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Package name, e.g. "react", "@vue/cli", "django". Scopes/slashes are handled automatically.',
        },
        registry: {
          type: 'string',
          description:
            'Registry name (default "npmjs.org"). e.g. "pypi.org", "crates.io", "rubygems.org", "nuget.org". Use list_registries to discover names.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'lookup_package',
    description:
      'Look up every registry a package or repository is published to, via package URL (purl) or repository URL. Returns matching package records across all registries. Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        purl: { type: 'string', description: 'A package URL, e.g. "pkg:npm/lodash" or "pkg:pypi/django".' },
        repository_url: {
          type: 'string',
          description: 'A source repository URL, e.g. "https://github.com/facebook/react".',
        },
      },
    },
  },
  {
    name: 'list_registries',
    description:
      'List the package registries ecosyste.ms supports (npm, PyPI, crates.io, Go, NuGet, Maven, RubyGems, Packagist, Docker Hub, and 100+ more) with their ecosystem and package counts. Keyless.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'get_package':
        return getPackage(args);
      case 'lookup_package':
        return lookupPackage(args);
      case 'list_registries':
        return listRegistries();
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function getPackage(args: Record<string, unknown>): Promise<unknown> {
  const name = typeof args.name === 'string' ? args.name.trim() : '';
  if (!name) return { error: 'provide a package name', name: args.name ?? null };
  const registry = (typeof args.registry === 'string' && args.registry.trim()) || 'npmjs.org';

  const url = `${BASE}/registries/${encodeURIComponent(registry)}/packages/${encodeURIComponent(name)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 404) return { error: 'package not found', name, registry };
  if (!res.ok) return { error: `ecosyste.ms: ${res.status} ${(await res.text()).slice(0, 200)}` };

  const p = (await res.json()) as Record<string, unknown>;
  return {
    name: p.name,
    ecosystem: p.ecosystem,
    registry,
    description: p.description,
    homepage: p.homepage,
    repository_url: p.repository_url,
    licenses: p.normalized_licenses ?? p.licenses,
    latest_version: p.latest_release_number,
    latest_published: p.latest_release_published_at,
    downloads: p.downloads,
    dependent_packages: p.dependent_packages_count,
    dependent_repos: p.dependent_repos_count,
    versions_count: p.versions_count,
    keywords: p.keywords ?? p.keywords_array,
    status: p.status,
  };
}

async function lookupPackage(args: Record<string, unknown>): Promise<unknown> {
  const purl = typeof args.purl === 'string' ? args.purl.trim() : '';
  const repositoryUrl = typeof args.repository_url === 'string' ? args.repository_url.trim() : '';
  if (!purl && !repositoryUrl) return { error: 'provide purl or repository_url' };

  const qs = purl
    ? `purl=${encodeURIComponent(purl)}`
    : `repository_url=${encodeURIComponent(repositoryUrl)}`;
  const res = await fetch(`${BASE}/packages/lookup?${qs}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) return { error: `ecosyste.ms: ${res.status} ${(await res.text()).slice(0, 200)}` };

  const arr = (await res.json()) as Array<Record<string, unknown>>;
  const list = Array.isArray(arr) ? arr : [];
  return {
    count: list.length,
    packages: list.map((p) => ({
      name: p.name,
      ecosystem: p.ecosystem,
      registry: (p.registry as Record<string, unknown> | undefined)?.name,
      description: p.description,
      latest_version: p.latest_release_number,
      dependent_packages: p.dependent_packages_count,
    })),
  };
}

async function listRegistries(): Promise<unknown> {
  const res = await fetch(`${BASE}/registries`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) return { error: `ecosyste.ms: ${res.status} ${(await res.text()).slice(0, 200)}` };

  const arr = (await res.json()) as Array<Record<string, unknown>>;
  const list = Array.isArray(arr) ? arr : [];
  return {
    count: list.length,
    registries: list.map((r) => ({
      name: r.name,
      ecosystem: r.ecosystem,
      packages_count: r.packages_count,
    })),
  };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
