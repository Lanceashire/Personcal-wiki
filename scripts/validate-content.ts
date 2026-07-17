import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { extractWikiLinks, normalizeWikiKey } from '../src/lib/wiki/graph';

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, 'content');
const files = globSync('**/*.{md,mdx}', { cwd: contentRoot, nodir: true });
const errors: string[] = [];
const requiredFields = ['title', 'description', 'category', 'type', 'difficulty', 'status', 'public', 'created', 'updated'];
const requiredSections = ['条目概览'];
const validTypes = new Set(['concept', 'algorithm', 'method', 'tool', 'project', 'reference']);
const validDifficulties = new Set(['beginner', 'intermediate', 'advanced']);
const validStatuses = new Set(['seedling', 'developing', 'complete', 'review-needed']);
const secretPatterns = [
  { label: 'Windows 用户绝对路径', pattern: /[A-Za-z]:\\Users\\[^\s]+/ },
  { label: 'macOS 用户绝对路径', pattern: /\/Users\/[^\s]+/ },
  { label: 'GitHub token', pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { label: 'OpenAI key', pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { label: 'AWS access key', pattern: /AKIA[0-9A-Z]{16}/ },
];

if (files.length === 0) errors.push('content/ 中没有可发布的 Wiki 条目。');

const records = files.map((relativePath) => {
  const absolutePath = path.join(contentRoot, relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  const parsed = matter(source);
  return { relativePath: relativePath.replace(/\\/g, '/'), source, data: parsed.data, body: parsed.content };
});

const index = new Map<string, string>();
const basenames = new Map<string, string[]>();
for (const record of records) {
  const slug = record.relativePath.replace(/\.(md|mdx)$/i, '');
  const aliases = Array.isArray(record.data.aliases) ? record.data.aliases : [];
  const keys = [record.data.title, ...aliases, slug].filter(Boolean).map(String);
  for (const key of keys) {
    const normalized = normalizeWikiKey(key);
    const existing = index.get(normalized);
    if (existing && existing !== record.relativePath) {
      errors.push(`${record.relativePath}: 标题、别名或 slug 与 ${existing} 冲突（${key}）。`);
    }
    index.set(normalized, record.relativePath);
  }
  const basename = slug.split('/').at(-1);
  if (basename) {
    const basenameKey = normalizeWikiKey(basename);
    basenames.set(basenameKey, [...(basenames.get(basenameKey) ?? []), record.relativePath]);
  }
}
for (const [key, matches] of basenames) {
  if (matches.length === 1 && !index.has(key)) index.set(key, matches[0]);
}

for (const record of records) {
  for (const field of requiredFields) {
    if (record.data[field] === undefined || record.data[field] === '') errors.push(`${record.relativePath}: 缺少 ${field}。`);
  }
  if (record.data.public !== true) errors.push(`${record.relativePath}: 公开仓库只允许 public: true 的条目。`);
  if (!Array.isArray(record.data.tags)) errors.push(`${record.relativePath}: tags 必须是数组。`);
  if (!Array.isArray(record.data.aliases)) errors.push(`${record.relativePath}: aliases 必须是数组。`);
  if (!Array.isArray(record.data.subcategories)) errors.push(`${record.relativePath}: subcategories 必须是数组。`);
  if (!Array.isArray(record.data.prerequisites)) errors.push(`${record.relativePath}: prerequisites 必须是数组。`);
  if (!Array.isArray(record.data.related)) errors.push(`${record.relativePath}: related 必须是数组。`);
  if (!Array.isArray(record.data.next)) errors.push(`${record.relativePath}: next 必须是数组。`);
  if (!validTypes.has(String(record.data.type))) errors.push(`${record.relativePath}: type 不在允许范围内。`);
  if (!validDifficulties.has(String(record.data.difficulty)))
    errors.push(`${record.relativePath}: difficulty 不在允许范围内。`);
  if (!validStatuses.has(String(record.data.status))) errors.push(`${record.relativePath}: status 不在允许范围内。`);
  if (record.body.trim().length < 150) errors.push(`${record.relativePath}: 正文过短，无法形成有效知识条目。`);

  for (const section of requiredSections) {
    if (!new RegExp(`^##\\s+${section}`, 'm').test(record.body)) errors.push(`${record.relativePath}: 缺少“${section}”章节。`);
  }
  if (record.data.type !== 'reference' && (record.body.match(/^##\s+/gm) ?? []).length < 2) {
    errors.push(`${record.relativePath}: 非参考条目至少需要一个“条目概览”之外的二级章节。`);
  }

  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(record.source)) errors.push(`${record.relativePath}: 检测到${label}。`);
  }

  const explicitReferences = [
    ...extractWikiLinks(record.body).map((link) => link.target),
    ...(Array.isArray(record.data.prerequisites) ? record.data.prerequisites : []),
    ...(Array.isArray(record.data.related) ? record.data.related : []),
    ...(Array.isArray(record.data.next) ? record.data.next : []),
  ];
  for (const reference of new Set(explicitReferences.map(String))) {
    if (!index.has(normalizeWikiKey(reference))) errors.push(`${record.relativePath}: 无法解析 Wikilink/关系“${reference}”。`);
  }

  for (const match of record.body.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    const asset = path.join(projectRoot, 'public', 'wiki-assets', match[1]);
    if (!fs.existsSync(asset)) errors.push(`${record.relativePath}: 缺少嵌入资源 public/wiki-assets/${match[1]}。`);
  }
}

if (errors.length > 0) {
  console.error(`内容验证失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`内容验证通过：${records.length} 个公开条目，未发现断链、缺失资源或隐私风险。`);
