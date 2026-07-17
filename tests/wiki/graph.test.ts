import assert from 'node:assert/strict';
import test from 'node:test';
import type { WikiEntry } from '../../src/lib/wiki/graph';
import { buildWikiGraph, buildWikiIndex, extractWikiLinks, parseWikiLink, resolveWikiEntry } from '../../src/lib/wiki/graph';

function entry(id: string, title: string, body: string, aliases: string[] = []): WikiEntry {
  return {
    id,
    collection: 'wiki',
    body,
    data: {
      title,
      aliases,
      description: `${title} description`,
      category: '测试',
      subcategories: [],
      tags: [],
      type: 'concept',
      difficulty: 'beginner',
      status: 'complete',
      public: true,
      created: new Date('2026-07-17'),
      updated: new Date('2026-07-17'),
      prerequisites: [],
      related: [],
      next: [],
    },
  } as WikiEntry;
}

test('parses aliases and heading anchors', () => {
  assert.deepEqual(parseWikiLink('线性回归#梯度下降求解|回归模型'), {
    target: '线性回归',
    heading: '梯度下降求解',
    alias: '回归模型',
  });
});

test('extracts wikilinks but ignores image embeds', () => {
  assert.deepEqual(extractWikiLinks('阅读 [[向量]] 与 [[线性回归|回归]]，忽略 ![[image.png]]。'), [
    { target: '向量' },
    { target: '线性回归', alias: '回归' },
  ]);
});

test('resolves titles and aliases case-insensitively', () => {
  const vector = entry('mathematics/vector', '向量', '', ['Vector']);
  const index = buildWikiIndex([vector]);
  assert.equal(resolveWikiEntry('vector', index), vector);
  assert.equal(resolveWikiEntry('向量', index), vector);
});

test('builds forward and reverse relationships', () => {
  const vector = entry('mathematics/vector', '向量', '');
  const regression = entry('ai/linear-regression', '线性回归', '先学习 [[向量]]。');
  const graph = buildWikiGraph([vector, regression]);
  assert.deepEqual(
    graph.get('ai/linear-regression')?.linksTo.map((item) => item.data.title),
    ['向量'],
  );
  assert.deepEqual(
    graph.get('mathematics/vector')?.linkedFrom.map((item) => item.data.title),
    ['线性回归'],
  );
});
