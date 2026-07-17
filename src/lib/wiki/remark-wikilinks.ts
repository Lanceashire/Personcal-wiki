import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import matter from 'gray-matter';
import type { Link, Parent, PhrasingContent, Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import { normalizeWikiKey, parseWikiLink } from './graph';

interface RemarkWikiLinkOptions {
  contentDirectory: string;
  base?: string;
}

interface ScannedEntry {
  slug: string;
  title: string;
  aliases: string[];
}

function scanEntries(contentDirectory: string): ScannedEntry[] {
  return globSync('**/*.{md,mdx}', { cwd: contentDirectory, nodir: true }).map((relativePath) => {
    const source = fs.readFileSync(path.join(contentDirectory, relativePath), 'utf8');
    const data = matter(source).data as Record<string, unknown>;
    return {
      slug: relativePath.replace(/\\/g, '/').replace(/\.(md|mdx)$/i, ''),
      title: String(data.title ?? path.basename(relativePath, path.extname(relativePath))),
      aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
    };
  });
}

function createIndex(entries: ScannedEntry[]): Map<string, ScannedEntry> {
  const index = new Map<string, ScannedEntry>();
  for (const entry of entries) {
    const basename = entry.slug.split('/').at(-1) ?? entry.slug;
    for (const key of [entry.title, ...entry.aliases, entry.slug, basename]) index.set(normalizeWikiKey(key), entry);
  }
  return index;
}

function normalizeBase(base = '/'): string {
  return base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`;
}

function encodeSlug(slug: string): string {
  return slug
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function remarkWikiLinks(options: RemarkWikiLinkOptions) {
  const index = createIndex(scanEntries(options.contentDirectory));
  const base = normalizeBase(options.base);

  return (tree: Root) => {
    visit(tree, 'text', (node: Text, indexInParent, parent: Parent | undefined) => {
      if (!parent || indexInParent === undefined || !node.value.includes('[[')) return;
      const parts: PhrasingContent[] = [];
      const pattern = /(!)?\[\[([^\]]+)\]\]/g;
      let cursor = 0;

      for (const match of node.value.matchAll(pattern)) {
        const start = match.index ?? 0;
        if (start > cursor) parts.push({ type: 'text', value: node.value.slice(cursor, start) });
        const parsed = parseWikiLink(match[2]);

        if (match[1]) {
          parts.push({
            type: 'image',
            url: `${base}wiki-assets/${encodeSlug(parsed.target)}`,
            alt: parsed.alias ?? parsed.target,
          });
        } else {
          const target = index.get(normalizeWikiKey(parsed.target));
          const slug = target?.slug ?? parsed.target;
          const url = `${base}wiki/${encodeSlug(slug)}${parsed.heading ? `#${encodeURIComponent(parsed.heading)}` : ''}`;
          const link: Link = {
            type: 'link',
            url,
            children: [{ type: 'text', value: parsed.alias ?? parsed.target }],
            data: { hProperties: { className: target ? ['wiki-link'] : ['wiki-link', 'wiki-link--missing'] } },
          };
          parts.push(link);
        }
        cursor = start + match[0].length;
      }

      if (parts.length === 0) return;
      if (cursor < node.value.length) parts.push({ type: 'text', value: node.value.slice(cursor) });
      parent.children.splice(indexInParent, 1, ...parts);
    });
  };
}
