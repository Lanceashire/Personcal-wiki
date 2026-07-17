# Personal Wiki

一个以 Obsidian Markdown 为内容来源、由 Codex 或 Claude 持续维护、自动部署到 GitHub Pages 的游戏 Wiki 风格个人知识库。

本项目基于 [cosZone/astro-koharu](https://github.com/cosZone/astro-koharu) v4.1.0 二次开发，保留其萌系粉蓝视觉、深浅色模式、响应式布局、KaTeX、Mermaid、Shiki 代码高亮、智能目录、阅读进度和 Pagefind 静态搜索能力。

## 当前能力

- `content/` 是公开 Obsidian 笔记与 Wiki 的正式接口。
- 严格的 Wiki Frontmatter schema；只有 `public: true` 可以进入仓库和构建。
- 支持 `[[条目]]`、`[[条目|别名]]`、`[[条目#标题]]` 与 `![[image.png]]`。
- 自动生成知识领域、标签索引、学习路线、正向关系和反向链接。
- 首页是知识库入口，不再是博客时间线。
- 内容验证会阻止断链、缺失资源、私有路径和常见凭据进入部署。
- GitHub Actions 自动执行类型检查、测试、内容验证、静态构建和 GitHub Pages 部署。

## 目录

```text
content/                       # 允许公开的 Wiki Markdown
src/lib/wiki/                  # Wikilink、关系图与内容查询
src/pages/wiki/                # 条目页面
src/pages/domains/             # 知识领域
src/pages/wiki-tags/           # 标签索引
scripts/validate-content.ts    # 内容与隐私验证
scripts/validate-dist.ts       # 静态产物验证
tests/wiki/                    # Wiki 核心逻辑测试
.github/workflows/             # 验证和 Pages 部署
```

## 开发命令

需要 Node.js 22 与 pnpm 9.15.1。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm validate:content
pnpm build
pnpm validate:dist
```

普通读者不需要安装上述工具，访问 GitHub Pages 即可使用。

## 内容维护

1. 只把明确允许公开的笔记放入 `content/`。
2. 按 [CONTENT_SCHEMA.md](./CONTENT_SCHEMA.md) 填写 Frontmatter。
3. 按 [WIKI_STYLE_GUIDE.md](./WIKI_STYLE_GUIDE.md) 整理正文。
4. 提交后由 Agent 读取 Git Diff，进行最小范围维护并运行完整验证。
5. 合并到 `main` 后由 GitHub Actions 自动部署。

完整的 Agent 工作约束见 [AGENTS.md](./AGENTS.md)，架构见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 隐私边界

仓库不会自动读取或上传完整 Obsidian Vault。未提交、未出现在 Agent 工作区、或未明确标记为公开的本地笔记，不属于可处理内容。构建产物会再次扫描本地绝对路径和常见凭据格式。

## 许可证与上游声明

本项目作为 astro-koharu 的衍生作品，依照 **GNU Affero General Public License v3.0** 发布。完整条款见 [LICENSE](./LICENSE)，上游作者与改动说明见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
