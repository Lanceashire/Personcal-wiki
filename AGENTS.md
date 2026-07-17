# Personal Wiki Agent Guide

## 每轮开始

1. 阅读 `AGENTS.md`、`CLAUDE.md`、`CONTENT_SCHEMA.md` 与 `WIKI_STYLE_GUIDE.md`。
2. 运行 `git status`、`git diff --stat`、`git diff`，只处理当前 Git Diff 中可见的变化。
3. 区分新增、修改、移动、删除的笔记与资源；不得声称处理了无法访问的本地文件。

## 内容规则

- `content/` 是公开内容的唯一正式接口，不上传完整 Obsidian Vault。
- 公开仓库中的条目必须显式设置 `public: true`。
- 保留用户事实与推导，不虚构论文来源、实验数据、课程原话或统计结论。
- 关系优先来自 Frontmatter、Wikilink、目录、分类、标签、标题和别名。
- 无法由显式信息确认的关系不得静默写成事实。
- 一篇笔记变化时，只更新受影响的条目、关系、索引和测试。

## 工程规则

- 保留 `LICENSE` 中的 AGPL-3.0、上游作者署名和 `THIRD_PARTY_NOTICES.md`。
- 优先复用 astro-koharu 已有的 Markdown、KaTeX、Mermaid、Shiki、Pagefind、主题与响应式能力。
- 架构逻辑放在 `src/lib/wiki/`，页面负责组合展示；可测试逻辑保持为纯函数。
- GitHub Pages 项目子路径为 `/Personcal-wiki`，所有新增内部链接必须使用 `import.meta.env.BASE_URL` 或 `wikiPath()`。

## 完成前验证

```bash
pnpm lint
pnpm check
pnpm test
pnpm validate:content
pnpm build
pnpm validate:dist
```

除退出码外，还应确认中文页面、Pagefind 索引、领域/标签/反向链接、资源路径和隐私扫描结果。
