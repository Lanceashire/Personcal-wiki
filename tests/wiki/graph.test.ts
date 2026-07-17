import assert from 'node:assert/strict';
import test from 'node:test';
import type { WikiEntry } from '../../src/lib/wiki/graph';
import { buildWikiGraph, buildWikiIndex, extractWikiLinks, parseWikiLink, resolveWikiEntry } from '../../src/lib/wiki/graph';
import { buildWikiNavigationTree } from '../../src/lib/wiki/tree';

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

function nestedEntry(id: string, title: string, category: string, subcategories: string[]): WikiEntry {
  const result = entry(id, title, '');
  result.data.category = category;
  result.data.subcategories = subcategories;
  return result;
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

test('does not resolve an ambiguous basename to an arbitrary entry', () => {
  const first = entry('course-a/99-review', '课程 A 复习', '');
  const second = entry('course-b/99-review', '课程 B 复习', '');
  const index = buildWikiIndex([first, second]);
  assert.equal(resolveWikiEntry('99-review', index), undefined);
  assert.equal(resolveWikiEntry('course-a/99-review', index), first);
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

test('builds a nested navigation tree and opens only the active path', () => {
  const overview = nestedEntry('course/01/overview', 'Overview', 'Course', ['Chapter 1']);
  const detail = nestedEntry('course/01/topic/detail', 'Detail', 'Course', ['Chapter 1', 'Topic']);
  const reference = nestedEntry('course/index', 'Index', 'Course', []);
  const [course] = buildWikiNavigationTree([detail, reference, overview], detail.id);

  assert.equal(course.label, 'Course');
  assert.equal(course.count, 3);
  assert.equal(course.active, true);
  assert.deepEqual(
    course.entries.map((item) => item.data.title),
    ['Index'],
  );
  assert.equal(course.children[0].label, 'Chapter 1');
  assert.equal(course.children[0].active, true);
  assert.equal(course.children[0].children[0].label, 'Topic');
  assert.equal(course.children[0].children[0].active, true);
});
