import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

const distRoot = path.join(process.cwd(), 'dist');
const errors: string[] = [];

if (!fs.existsSync(distRoot)) {
  console.error('dist/ 不存在，请先运行 pnpm build。');
  process.exit(1);
}

const htmlFiles = globSync('**/*.html', { cwd: distRoot, nodir: true });
const requiredSuffixes = [
  'index.html',
  'domains/index.html',
  'learning-paths/index.html',
  'wiki/artificial-intelligence/linear-regression/index.html',
];

for (const suffix of requiredSuffixes) {
  if (!htmlFiles.some((file) => file.replace(/\\/g, '/').endsWith(suffix))) errors.push(`缺少页面：${suffix}`);
}

const generatedFiles = globSync('**/*', { cwd: distRoot, nodir: true });
const hasPagefind = generatedFiles.some((file) => /(^|\/)pagefind(\/|$)/.test(file.replace(/\\/g, '/')));
if (!hasPagefind) errors.push('未找到 Pagefind 搜索索引。');

const forbidden = [
  /[A-Za-z]:\\Users\\(?!yourname(?:\\|$)|username(?:\\|$)|example(?:\\|$))/i,
  /\/Users\/(?!yourname(?:\/|$)|username(?:\/|$)|example(?:\/|$))[^\s<"']+/,
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9_-]{20,}/,
];
for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(path.join(distRoot, htmlFile), 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(html)) errors.push(`${htmlFile}: 构建产物包含疑似私有路径或凭据。`);
  }
  if (/href="\/(wiki|domains|learning-paths|wiki-tags)\//.test(html)) {
    errors.push(`${htmlFile}: 存在未添加 GitHub Pages base path 的 Wiki 链接。`);
  }
  if (/\/Personcal-wiki(?:wiki|domains|learning-paths|wiki-tags|katex)(?:\/|"|')/.test(html)) {
    errors.push(`${htmlFile}: 存在缺少斜杠的 GitHub Pages 链接。`);
  }
}

if (errors.length > 0) {
  console.error(`构建产物验证失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`构建产物验证通过：${htmlFiles.length} 个 HTML 页面，Pagefind 与 GitHub Pages 子路径正常。`);
