---
layout: ../layouts/PageLayout.astro
title: 关于这座知识库
description: Personal Wiki 的定位、维护方式与隐私边界。
coverTitle: About Personal Wiki
comments: false
---

# 关于这座知识库

Personal Wiki 是一个以 Obsidian Markdown 为原始知识接口、由 Codex 或 Claude 通过 Git Diff 增量维护、最终部署到 GitHub Pages 的静态个人知识库。

## 它不是什么

- 不是 Obsidian 插件。
- 不是在线编辑器、用户系统或数据库。
- 不会自动上传完整本地 Vault。
- 不把模型猜测的知识关系静默写成事实。

## 维护闭环

用户选择并提交公开笔记后，Agent 检查差异、Frontmatter、条目完整度、Wikilink 与资源，再运行类型检查、测试、内容验证和静态构建。合并到 `main` 后，GitHub Actions 发布 GitHub Pages。

## 开源与署名

本站基于 [astro-koharu](https://github.com/cosZone/astro-koharu) v4.1.0 二次开发，依照 AGPL-3.0 发布。上游署名与修改说明见仓库中的 `THIRD_PARTY_NOTICES.md`。
