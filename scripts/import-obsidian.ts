import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { slugify } from 'transliteration';
import YAML from 'yaml';

interface SourceDefinition {
  id: string;
  category: string;
  directory: string[];
}

interface ImportedRecord {
  source: SourceDefinition;
  sourceRoot: string;
  sourceAbsolute: string;
  vaultRelative: string;
  sourceRelative: string;
  outputRelative: string;
  raw: string;
  body: string;
  sourceData: Record<string, unknown>;
  originalTitle: string;
  title: string;
  aliases: string[];
  description: string;
  category: string;
  subcategories: string[];
  tags: string[];
  type: 'concept' | 'algorithm' | 'method' | 'tool' | 'project' | 'reference';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'seedling' | 'developing' | 'complete' | 'review-needed';
  prerequisites: string[];
  related: string[];
  next: string[];
}

interface ResolvedTarget {
  title: string;
  imported?: ImportedRecord;
}

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, 'content');
const reportPath = path.join(projectRoot, 'docs', 'obsidian-import-report.md');
const vaultArgumentIndex = process.argv.indexOf('--vault');
const vaultRoot = path.resolve(
  vaultArgumentIndex >= 0 && process.argv[vaultArgumentIndex + 1]
    ? process.argv[vaultArgumentIndex + 1]
    : path.join(projectRoot, '..'),
);
const importDate = new Date().toISOString().slice(0, 10);

const sources: SourceDefinition[] = [
  { id: 'data-structures', category: '数据结构', directory: ['数据结构'] },
  { id: 'data-mining', category: '数据挖掘', directory: ['数据挖掘导论'] },
  {
    id: 'ai-engineering',
    category: 'AI 工程',
    directory: ['ai工程学习', 'AI Engineering from Scratch'],
  },
  {
    id: 'python-data-analysis',
    category: 'Python 与数据分析',
    directory: ['python基础学习', 'Python基础与数据分析'],
  },
  { id: 'computer-networks', category: '计算机网络', directory: ['计算机网络'] },
];

const secretPatterns = [
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9_-]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('zh-CN');
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function withoutExtension(value: string): string {
  return value.replace(/\.(md|mdx)$/i, '');
}

function isExcluded(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/');
  const basename = path.posix.basename(normalized);
  return (
    /(^|\/)(\.obsidian|mappings|manifests)(\/|$)/.test(normalized) ||
    /unresolved-dialogue/i.test(normalized) ||
    /^(?:00-(?:(?:课程|本章))?目录|98-文件清单|目录)\.md$/i.test(basename)
  );
}

function cleanNumberPrefix(value: string): string {
  return value
    .replace(/^第\s*\d+\s*章\s*[：:-]?\s*/u, '')
    .replace(/^\d+(?:\.\d+)*(?:\.\d+)?\s*[-：:.]?\s*/u, '')
    .trim();
}

function cleanTitle(value: string): string {
  const cleaned = cleanNumberPrefix(
    value
      .replace(/^#+\s*/, '')
      .replace(/^['"]|['"]$/g, '')
      .trim(),
  );
  return cleaned || value.trim();
}

function cleanPathLabel(value: string): string {
  const cleaned = cleanNumberPrefix(
    value
      .replace(/^第\d+章[-_]?/u, '')
      .replace(/^\d+[-_]/u, '')
      .replace(/[-_]+/g, ' ')
      .trim(),
  );
  const translations: Record<string, string> = {
    'Math Foundations': '数学基础',
    'Linear Algebra Intuition': '线性代数直觉',
    Preliminaries: '预备知识',
  };
  return translations[cleaned] ?? cleaned;
}

function toSlug(value: string): string {
  const result = slugify(withoutExtension(value), { lowercase: true, separator: '-' })
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return result || 'note';
}

function titleFromDocument(relativePath: string, parsed: matter.GrayMatterFile<string>): string {
  if (typeof parsed.data.title === 'string' && parsed.data.title.trim()) return cleanTitle(parsed.data.title);
  const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
  return cleanTitle(heading ?? path.basename(relativePath, path.extname(relativePath)));
}

function descriptionFromBody(title: string, category: string, body: string, sourceData: Record<string, unknown>): string {
  if (typeof sourceData.description === 'string' && sourceData.description.trim()) {
    return cleanInline(sourceData.description).slice(0, 180);
  }

  const summary = body.match(/^>\s*\[!summary\][^\n]*\r?\n((?:>.*\r?\n?)+)/m)?.[1];
  if (summary) {
    const cleaned = cleanInline(summary.replace(/^>\s?/gm, ''));
    if (cleaned.length >= 12) return cleaned.slice(0, 180);
  }

  const lines = body.replace(/^#\s+.*$/m, '').split(/\r?\n/);
  let paragraph: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      const candidate = cleanInline(paragraph.join(' '));
      if (candidate.length >= 24) return candidate.slice(0, 180);
      paragraph = [];
      continue;
    }
    if (/^(?:#{1,6}\s|[-*+]\s|\d+\.\s|>|```|~~~|\||---$)/.test(trimmed)) continue;
    paragraph.push(trimmed);
  }

  const candidate = cleanInline(paragraph.join(' '));
  if (candidate.length >= 12) return candidate.slice(0, 180);
  return `${title}是${category}知识体系中的一个条目，本文整理其核心概念、原理、示例与应用边界。`;
}

function cleanInline(value: string): string {
  return value
    .replace(/!?(?:\[\[)([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, '$2$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function subcategoriesFromPath(relativePath: string): string[] {
  const segments = relativePath.replace(/\\/g, '/').split('/').slice(0, -1);
  return unique(
    segments
      .filter((segment) => !/^(indexes|supplementary)$/i.test(segment))
      .map(cleanPathLabel)
      .filter(Boolean),
  ).slice(-3);
}

function tagsFromSource(category: string, subcategories: string[], sourceData: Record<string, unknown>): string[] {
  const sourceTags = Array.isArray(sourceData.tags) ? sourceData.tags.map(String) : [];
  return unique([
    category,
    ...subcategories,
    ...sourceTags.filter((tag) => !/^(Obsidian|MOC|textbook-note)$/i.test(tag)),
  ]).slice(0, 10);
}

function classifyType(title: string): ImportedRecord['type'] {
  const value = title;
  if (/索引|目录|复习|自测|速查|对比|辨析|清单|术语|资源|路线|公式|使用说明/.test(value)) return 'reference';
  if (/算法|排序|查找|KMP|匹配|遍历|搜索|散列|分类|聚类|回归|异常检测/.test(value)) return 'algorithm';
  if (/Jupyter|IPython|解释器|环境配置|工具|数据集/i.test(value)) return 'tool';
  if (/方法|操作|求值|建立|插入|删除|合并|处理|编码|拟合|计算/.test(value)) return 'method';
  return 'concept';
}

function classifyDifficulty(relativePath: string, sourceData: Record<string, unknown>): ImportedRecord['difficulty'] {
  const depth = String(sourceData.depth_level ?? '');
  if (/advanced|expert/i.test(depth) || /高级|综合|证明|推导|复杂度与综合|矩阵的几何意义/.test(relativePath)) {
    return 'advanced';
  }
  if (/deep|intermediate/i.test(depth) || /supplementary|复习|强化|优化|复杂度/.test(relativePath)) {
    return 'intermediate';
  }
  return 'beginner';
}

function classifyStatus(body: string, sourceData: Record<string, unknown>): ImportedRecord['status'] {
  if (/sample-from-public-preview/i.test(String(sourceData.status ?? '')) || /待实体教材核对|本章仍需确认/.test(body)) {
    return 'review-needed';
  }
  const headingCount = (body.match(/^##\s+/gm) ?? []).length;
  if (body.length < 450) return 'seedling';
  if (body.length < 900 || headingCount < 2) return 'developing';
  return 'complete';
}

function safeGeneratedDirectory(directory: string): string {
  const resolved = path.resolve(directory);
  const requiredPrefix = `${path.resolve(contentRoot)}${path.sep}`;
  if (!resolved.startsWith(requiredPrefix)) throw new Error(`拒绝操作 content/ 之外的目录：${resolved}`);
  return resolved;
}

function scanSource(source: SourceDefinition): ImportedRecord[] {
  const sourceRoot = path.join(vaultRoot, ...source.directory);
  if (!fs.existsSync(sourceRoot)) throw new Error(`找不到 Obsidian 知识目录：${source.directory.join('/')}`);

  return globSync('**/*.md', { cwd: sourceRoot, nodir: true })
    .filter((relativePath) => !isExcluded(relativePath))
    .map((relativePath) => createRecord(source, sourceRoot, relativePath));
}

function createRecord(source: SourceDefinition, sourceRoot: string, sourceRelative: string): ImportedRecord {
  const sourceAbsolute = path.join(sourceRoot, sourceRelative);
  const raw = fs.readFileSync(sourceAbsolute, 'utf8');
  for (const pattern of secretPatterns) {
    if (pattern.test(raw)) throw new Error(`疑似凭据，停止导入：${path.relative(vaultRoot, sourceAbsolute)}`);
  }
  const parsed = matter(raw);
  const originalTitle = titleFromDocument(sourceRelative, parsed);
  const subcategories = subcategoriesFromPath(sourceRelative);
  const outputSegments = withoutExtension(sourceRelative).replace(/\\/g, '/').split('/').map(toSlug);

  return {
    source,
    sourceRoot,
    sourceAbsolute,
    vaultRelative: path.relative(vaultRoot, sourceAbsolute).replace(/\\/g, '/'),
    sourceRelative: sourceRelative.replace(/\\/g, '/'),
    outputRelative: `${source.id}/${outputSegments.join('/')}.md`,
    raw,
    body: parsed.content,
    sourceData: parsed.data as Record<string, unknown>,
    originalTitle,
    title: originalTitle,
    aliases: [],
    description: descriptionFromBody(originalTitle, source.category, parsed.content, parsed.data),
    category: source.category,
    subcategories,
    tags: tagsFromSource(source.category, subcategories, parsed.data),
    type: classifyType(originalTitle),
    difficulty: classifyDifficulty(sourceRelative, parsed.data),
    status: classifyStatus(parsed.content, parsed.data),
    prerequisites: [],
    related: [],
    next: [],
  };
}

function addStandaloneOverview(records: ImportedRecord[]): void {
  const overviewPath = path.join(vaultRoot, '01-绪论.md');
  if (!fs.existsSync(overviewPath)) return;
  const source = sources.find((candidate) => candidate.id === 'data-mining');
  if (!source) return;
  const record = createRecord(source, vaultRoot, '01-绪论.md');
  record.sourceRelative = 'overview/01-绪论.md';
  record.outputRelative = 'data-mining/overview/01-xu-lun.md';
  record.subcategories = ['绪论'];
  record.tags = unique([...record.tags, '知识发现', '数据科学']);
  records.push(record);
}

function contextualTitle(record: ImportedRecord): string {
  const segments = record.sourceRelative.split('/').slice(0, -1).reverse();
  const context = segments.find((segment) => {
    const label = cleanPathLabel(segment);
    return !/^(indexes|supplementary|overview)$/i.test(segment) && !/^(本章复习|复习|综合应用)$/.test(label);
  });
  return `${context ? cleanPathLabel(context) : record.category} · ${record.originalTitle}`;
}

function disambiguateTitles(records: ImportedRecord[], reservedTitles: Set<string>): void {
  const groups = new Map<string, ImportedRecord[]>();
  for (const record of records) {
    const group = groups.get(normalize(record.title)) ?? [];
    group.push(record);
    groups.set(normalize(record.title), group);
  }

  for (const group of groups.values()) {
    if (group.length <= 1) continue;
    for (const record of group) record.title = contextualTitle(record);
  }

  for (const record of records) {
    if (reservedTitles.has(normalize(record.title))) record.title = `${record.category} · ${record.title}`;
  }

  const finalTitles = new Set<string>();
  for (const record of records) {
    let key = normalize(record.title);
    if (finalTitles.has(key)) {
      record.title = `${record.category} · ${record.title}`;
      key = normalize(record.title);
    }
    if (finalTitles.has(key)) {
      record.title = `${record.title} · ${toSlug(record.sourceRelative)}`;
      key = normalize(record.title);
    }
    if (finalTitles.has(key)) throw new Error(`无法消除标题冲突：${record.title}`);
    finalTitles.add(key);
  }

  const originalFrequencies = new Map<string, number>();
  for (const record of records) {
    const key = normalize(record.originalTitle);
    originalFrequencies.set(key, (originalFrequencies.get(key) ?? 0) + 1);
  }
  const aliasCandidates = new Map<ImportedRecord, string[]>();
  const aliasFrequencies = new Map<string, number>();
  for (const record of records) {
    const sourceAliases = Array.isArray(record.sourceData.aliases) ? record.sourceData.aliases.map(String) : [];
    const candidates = [
      ...sourceAliases,
      ...(record.originalTitle !== record.title && originalFrequencies.get(normalize(record.originalTitle)) === 1
        ? [record.originalTitle]
        : []),
    ];
    const available = unique(candidates).filter(
      (alias) => normalize(alias) !== normalize(record.title) && !finalTitles.has(normalize(alias)),
    );
    aliasCandidates.set(record, available);
    for (const alias of available) {
      const key = normalize(alias);
      aliasFrequencies.set(key, (aliasFrequencies.get(key) ?? 0) + 1);
    }
  }
  for (const record of records) {
    record.aliases = (aliasCandidates.get(record) ?? []).filter((alias) => aliasFrequencies.get(normalize(alias)) === 1);
  }
}

function loadExistingTargets(): Map<string, ResolvedTarget> {
  const generatedRoots = new Set(sources.map((source) => source.id));
  const targets = new Map<string, ResolvedTarget>();
  for (const relativePath of globSync('**/*.{md,mdx}', { cwd: contentRoot, nodir: true })) {
    const root = relativePath.replace(/\\/g, '/').split('/')[0];
    if (generatedRoots.has(root)) continue;
    const parsed = matter(fs.readFileSync(path.join(contentRoot, relativePath), 'utf8'));
    if (typeof parsed.data.title !== 'string') continue;
    const title = parsed.data.title;
    for (const key of [title, ...(Array.isArray(parsed.data.aliases) ? parsed.data.aliases.map(String) : [])]) {
      targets.set(normalize(key), { title });
    }
  }
  return targets;
}

function buildResolvers(records: ImportedRecord[], existingTargets: Map<string, ResolvedTarget>) {
  const byAbsolutePath = new Map<string, ImportedRecord>();
  const byKey = new Map<string, ImportedRecord[]>();
  for (const record of records) {
    byAbsolutePath.set(normalize(withoutExtension(path.resolve(record.sourceAbsolute))), record);
    const basename = withoutExtension(path.basename(record.sourceAbsolute));
    for (const key of [record.originalTitle, record.title, basename, cleanTitle(basename), ...record.aliases]) {
      const normalized = normalize(key);
      const values = byKey.get(normalized) ?? [];
      values.push(record);
      byKey.set(normalized, values);
    }
  }

  const resolve = (record: ImportedRecord, rawTarget: string): ResolvedTarget | undefined => {
    const target = withoutExtension(rawTarget.trim().replace(/\\/g, '/'));
    const pathCandidates = [
      path.resolve(path.dirname(record.sourceAbsolute), target),
      path.resolve(vaultRoot, target),
      ...sources.map((source) => path.resolve(vaultRoot, ...source.directory, target)),
    ];
    for (const candidate of pathCandidates) {
      const match = byAbsolutePath.get(normalize(withoutExtension(candidate)));
      if (match) return { title: match.title, imported: match };
    }

    const keyed = byKey.get(normalize(target));
    if (keyed?.length === 1) return { title: keyed[0].title, imported: keyed[0] };
    const basenameKeyed = byKey.get(normalize(cleanTitle(path.posix.basename(target))));
    if (basenameKeyed?.length === 1) return { title: basenameKeyed[0].title, imported: basenameKeyed[0] };
    return existingTargets.get(normalize(target)) ?? existingTargets.get(normalize(path.posix.basename(target)));
  };

  return { resolve };
}

function splitWikiLink(raw: string): { target: string; heading?: string; alias?: string } {
  const [destination, alias] = raw.replace(/\\\|/g, '|').split('|', 2);
  const hashIndex = destination.indexOf('#');
  if (hashIndex < 0) return { target: destination.trim(), ...(alias?.trim() ? { alias: alias.trim() } : {}) };
  return {
    target: destination.slice(0, hashIndex).trim(),
    heading: destination.slice(hashIndex + 1).trim(),
    ...(alias?.trim() ? { alias: alias.trim() } : {}),
  };
}

function transformBody(
  record: ImportedRecord,
  resolve: (record: ImportedRecord, rawTarget: string) => ResolvedTarget | undefined,
  unresolved: Map<string, Set<string>>,
): { body: string; outgoing: string[] } {
  let body = record.body.replace(/^\s*#\s+.*?(?:\r?\n)+/, '').trim();
  body = body.replace(/[A-Za-z]:\\[^\r\n`<>]+/g, '[本地路径已移除]');
  const outgoing: string[] = [];
  let inFence = false;
  const transformedLines = body.split(/\r?\n/).map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;
    return line.replace(/(!)?\[\[([^\]]+)\]\]/g, (_match, embed: string | undefined, raw: string) => {
      const parsed = splitWikiLink(raw);
      const resolved = resolve(record, parsed.target);
      if (!resolved) {
        const values = unresolved.get(record.vaultRelative) ?? new Set<string>();
        values.add(parsed.target);
        unresolved.set(record.vaultRelative, values);
        return parsed.alias ?? cleanTitle(path.posix.basename(parsed.target));
      }
      outgoing.push(resolved.title);
      const heading = parsed.heading ? `#${parsed.heading}` : '';
      const alias = parsed.alias ? `|${parsed.alias}` : '';
      if (embed) return parsed.alias ?? resolved.title;
      return `[[${resolved.title}${heading}${alias}]]`;
    });
  });

  const overview = `## 条目概览\n\n${record.description}`;
  const normalizedBody = transformedLines
    .join('\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
  return { body: `${overview}\n\n${normalizedBody}\n`, outgoing: unique(outgoing) };
}

function relationModeForLine(line: string): 'prerequisites' | 'related' | 'next' | undefined {
  if (/上级知识点|前置知识|先修/.test(line)) return 'prerequisites';
  if (/相关知识点|关联知识/.test(line)) return 'related';
  if (/后续学习|下一步/.test(line)) return 'next';
  return undefined;
}

function explicitRelations(
  record: ImportedRecord,
  resolve: (record: ImportedRecord, rawTarget: string) => ResolvedTarget | undefined,
) {
  const result = { prerequisites: [] as string[], related: [] as string[], next: [] as string[] };
  let mode: keyof typeof result | undefined;
  for (const line of record.body.split(/\r?\n/).slice(0, 45)) {
    const detected = relationModeForLine(line);
    if (detected) mode = detected;
    if (!line.trim()) mode = undefined;
    if (!mode) continue;
    for (const match of line.matchAll(/(?<!!)\[\[([^\]]+)\]\]/g)) {
      const parsed = splitWikiLink(match[1]);
      const target = resolve(record, parsed.target);
      if (target?.imported && target.imported.type !== 'reference') result[mode].push(target.title);
    }
  }
  return {
    prerequisites: unique(result.prerequisites),
    related: unique(result.related),
    next: unique(result.next),
  };
}

function establishRelations(
  records: ImportedRecord[],
  outgoingByRecord: Map<ImportedRecord, string[]>,
  resolve: (record: ImportedRecord, rawTarget: string) => ResolvedTarget | undefined,
): void {
  const byCategory = new Map<string, ImportedRecord[]>();
  for (const record of records.filter((candidate) => candidate.type !== 'reference')) {
    const group = byCategory.get(record.category) ?? [];
    group.push(record);
    byCategory.set(record.category, group);
  }

  for (const group of byCategory.values()) {
    group.sort((a, b) => a.sourceRelative.localeCompare(b.sourceRelative, 'zh-CN', { numeric: true }));
    for (let index = 0; index < group.length; index += 1) {
      const record = group[index];
      const explicit = explicitRelations(record, resolve);
      record.prerequisites = unique([
        ...explicit.prerequisites,
        ...(explicit.prerequisites.length === 0 && index > 0 ? [group[index - 1].title] : []),
      ]).slice(0, 3);
      record.next = unique([
        ...explicit.next,
        ...(explicit.next.length === 0 && index < group.length - 1 ? [group[index + 1].title] : []),
      ]).slice(0, 3);
      record.related = unique([...explicit.related, ...(outgoingByRecord.get(record) ?? [])])
        .filter((title) => title !== record.title && !record.prerequisites.includes(title) && !record.next.includes(title))
        .slice(0, 6);
    }
  }

  for (const record of records.filter((candidate) => candidate.type === 'reference')) {
    record.related = unique(outgoingByRecord.get(record) ?? [])
      .filter((title) => title !== record.title)
      .slice(0, 8);
  }
}

function writeRecords(records: ImportedRecord[], transformedBodies: Map<ImportedRecord, string>): void {
  for (const source of sources) {
    const generatedDirectory = safeGeneratedDirectory(path.join(contentRoot, source.id));
    if (fs.existsSync(generatedDirectory)) fs.rmSync(generatedDirectory, { recursive: true, force: true });
  }

  for (const record of records) {
    const destination = path.join(contentRoot, record.outputRelative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const data = {
      title: record.title,
      aliases: record.aliases,
      description: record.description,
      category: record.category,
      subcategories: record.subcategories,
      tags: record.tags,
      type: record.type,
      difficulty: record.difficulty,
      status: record.status,
      public: true,
      created: importDate,
      updated: importDate,
      prerequisites: record.prerequisites,
      related: record.related,
      next: record.next,
    };
    const frontmatter = YAML.stringify(data, { lineWidth: 0 }).trimEnd();
    const body = transformedBodies.get(record);
    if (!body) throw new Error(`缺少转换正文：${record.title}`);
    fs.writeFileSync(destination, `---\n${frontmatter}\n---\n\n${body}`, 'utf8');
  }
}

function writeReport(records: ImportedRecord[], unresolved: Map<string, Set<string>>, excludedCount: number): void {
  const categoryLines = [...new Set(records.map((record) => record.category))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((category) => `| ${category} | ${records.filter((record) => record.category === category).length} |`)
    .join('\n');
  const unresolvedCount = [...unresolved.values()].reduce((total, values) => total + values.size, 0);
  const unresolvedLines = [...unresolved.entries()]
    .slice(0, 80)
    .map(([file, targets]) => `- \`${file}\`：${[...targets].join('、')}`)
    .join('\n');
  const report = `# Obsidian 导入报告

生成日期：${importDate}

## 汇总

| 领域 | 已导入条目 |
| --- | ---: |
${categoryLines}

- 已导入：${records.length} 篇
- 已排除维护文件：${excludedCount} 篇
- 已移除本机绝对路径元数据
- 无法解析且已降级为普通文本的引用：${unresolvedCount} 个

## 导入边界

- 导入课程知识、复习材料、术语表、薄弱点索引和外部资源索引。
- 不导入 \`.obsidian\`、课程目录、章节目录、Agent 映射和维护日志。
- 不将未解析链接伪装成事实关系；它们在正文中保留为普通文本。
- 每次同步可运行 \`pnpm import:obsidian\`，默认读取仓库上一级目录中的 Vault。

## 未解析引用

${unresolvedLines || '无。'}
`;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report, 'utf8');
}

const existingTargets = loadExistingTargets();
const records = sources.flatMap(scanSource);
addStandaloneOverview(records);
disambiguateTitles(records, new Set(existingTargets.keys()));

const { resolve } = buildResolvers(records, existingTargets);
const unresolved = new Map<string, Set<string>>();
const transformedBodies = new Map<ImportedRecord, string>();
const outgoingByRecord = new Map<ImportedRecord, string[]>();
for (const record of records) {
  const transformed = transformBody(record, resolve, unresolved);
  transformedBodies.set(record, transformed.body);
  outgoingByRecord.set(record, transformed.outgoing);
}
establishRelations(records, outgoingByRecord, resolve);
writeRecords(records, transformedBodies);

const totalMarkdown =
  sources.reduce((total, source) => {
    const sourceRoot = path.join(vaultRoot, ...source.directory);
    return total + globSync('**/*.md', { cwd: sourceRoot, nodir: true }).length;
  }, 0) + (fs.existsSync(path.join(vaultRoot, '01-绪论.md')) ? 1 : 0);
writeReport(records, unresolved, totalMarkdown - records.length);

console.log(`Obsidian 导入完成：${records.length} 篇条目，${unresolved.size} 篇含未解析引用。`);
