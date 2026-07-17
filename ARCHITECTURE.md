# Architecture

## 系统边界

```text
Obsidian（本地编辑）
  → 经过用户选择后提交公开 Markdown 到 content/
  → Astro Content Collection 校验 schema
  → Wiki 关系模块解析显式关系与 Wikilink
  → Astro 生成首页、领域、标签、学习路线和条目页面
  → Pagefind 建立静态索引
  → 产物隐私与路径验证
  → GitHub Pages
```

本系统不直接读取未提交的 Vault，也不是 Obsidian 插件。

## 模块

- `src/content/config.ts`：`wiki` 内容集合和公开 schema。
- `src/lib/wiki/graph.ts`：Wikilink 解析、别名索引、正向/反向关系图。
- `src/lib/wiki/remark-wikilinks.ts`：将 Obsidian Wikilink 转为静态 HTML 链接或图片。
- `src/lib/wiki/content.ts`：Astro 内容集合查询边界。
- `src/components/wiki/`：Wiki 导航组件。
- `src/pages/`：静态路由层。
- `scripts/validate-content.ts`：构建前完整性和隐私门禁。
- `scripts/validate-dist.ts`：构建后页面、搜索、子路径和泄露门禁。

## 知识关系

每个公开条目是一个节点。边来自正文 Wikilink，以及 `prerequisites`、`related`、`next`。解析器同时生成 `linksTo` 与 `linkedFrom`。模型推测不会自动成为图中的边。

## GitHub Pages

Astro 的固定 base 为 `/Personcal-wiki`。本地和 CI 使用相同 base 构建，避免只在部署后出现根路径错误。工作流上传 `dist/`，由官方 Pages Action 发布。
