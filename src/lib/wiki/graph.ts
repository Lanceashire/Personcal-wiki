import type { CollectionEntry } from 'astro:content';

export type WikiEntry = CollectionEntry<'wiki'>;

export interface ParsedWikiLink {
  target: string;
  alias?: string;
  heading?: string;
}

export interface WikiGraphNode {
  entry: WikiEntry;
  linksTo: WikiEntry[];
  linkedFrom: WikiEntry[];
  unresolved: string[];
}

export function normalizeWikiKey(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/i, '')
    .trim()
    .toLocaleLowerCase('zh-CN');
}

export function getWikiSlug(entry: WikiEntry): string {
  return entry.id.replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
}

export function parseWikiLink(raw: string): ParsedWikiLink {
  const [destination, alias] = raw.replace(/\\\|/g, '|').split('|', 2);
  const [target, heading] = destination.split('#', 2);
  return {
    target: target.trim(),
    ...(alias?.trim() ? { alias: alias.trim() } : {}),
    ...(heading?.trim() ? { heading: heading.trim() } : {}),
  };
}

export function extractWikiLinks(markdown: string): ParsedWikiLink[] {
  const links: ParsedWikiLink[] = [];
  const pattern = /(?<!!)\[\[([^\]]+)\]\]/g;
  for (const match of markdown.matchAll(pattern)) {
    const link = parseWikiLink(match[1]);
    if (link.target) links.push(link);
  }
  return links;
}

export function buildWikiIndex(entries: WikiEntry[]): Map<string, WikiEntry> {
  const index = new Map<string, WikiEntry>();
  for (const entry of entries) {
    const slug = getWikiSlug(entry);
    const basename = slug.split('/').at(-1) ?? slug;
    const keys = [entry.data.title, ...entry.data.aliases, slug, basename];
    for (const key of keys) index.set(normalizeWikiKey(key), entry);
  }
  return index;
}

export function resolveWikiEntry(reference: string, index: Map<string, WikiEntry>): WikiEntry | undefined {
  return index.get(normalizeWikiKey(reference));
}

export function buildWikiGraph(entries: WikiEntry[]): Map<string, WikiGraphNode> {
  const index = buildWikiIndex(entries);
  const nodes = new Map<string, WikiGraphNode>();

  for (const entry of entries) {
    nodes.set(getWikiSlug(entry), { entry, linksTo: [], linkedFrom: [], unresolved: [] });
  }

  for (const entry of entries) {
    const source = nodes.get(getWikiSlug(entry));
    if (!source) continue;
    const references = new Set([
      ...extractWikiLinks(entry.body ?? '').map((link) => link.target),
      ...entry.data.prerequisites,
      ...entry.data.related,
      ...entry.data.next,
    ]);

    for (const reference of references) {
      const target = resolveWikiEntry(reference, index);
      if (!target) {
        source.unresolved.push(reference);
        continue;
      }
      if (target.id === entry.id) continue;
      const targetNode = nodes.get(getWikiSlug(target));
      if (!targetNode) continue;
      source.linksTo.push(target);
      targetNode.linkedFrom.push(entry);
    }
  }

  return nodes;
}

export function groupWikiEntries(entries: WikiEntry[]): Map<string, WikiEntry[]> {
  const groups = new Map<string, WikiEntry[]>();
  for (const entry of entries) {
    const group = groups.get(entry.data.category) ?? [];
    group.push(entry);
    groups.set(entry.data.category, group);
  }
  for (const group of groups.values()) group.sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh-CN'));
  return groups;
}

export function sitePath(pathname: string, base = '/'): string {
  const normalizedBase = base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`;
  const normalizedPath = pathname.replace(/^\/+/, '');
  return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}

export function wikiPath(entry: WikiEntry, base = '/'): string {
  const encodedSlug = getWikiSlug(entry)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return sitePath(`wiki/${encodedSlug}`, base);
}
