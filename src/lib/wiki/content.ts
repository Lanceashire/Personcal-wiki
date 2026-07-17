import { getCollection } from 'astro:content';
import type { WikiEntry } from './graph';

export async function getPublicWikiEntries(): Promise<WikiEntry[]> {
  const entries = await getCollection('wiki', ({ data }) => data.public === true);
  return [...entries].sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh-CN'));
}

export async function getWikiEntryById(id: string): Promise<WikiEntry | undefined> {
  const entries = await getPublicWikiEntries();
  return entries.find((entry) => entry.id === id);
}
