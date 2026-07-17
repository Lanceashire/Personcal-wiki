# Content Schema

所有公开 Wiki 条目位于 `content/`，支持 `.md` 与 `.mdx`。

```yaml
---
title: 线性回归
aliases:
  - Linear Regression
description: 使用线性函数描述输入变量与连续目标变量关系的监督学习方法。
category: 人工智能
subcategories:
  - 机器学习
  - 监督学习
tags:
  - 回归
type: algorithm # concept | algorithm | method | tool | project | reference
difficulty: beginner # beginner | intermediate | advanced
status: complete # seedling | developing | complete | review-needed
public: true
created: 2026-07-17
updated: 2026-07-17
prerequisites:
  - 向量
related:
  - 梯度下降
next: []
---
```

## 约束

- `title`、`description`、`category`、`type`、`difficulty`、`status`、`created`、`updated` 必填。
- `public` 在公开仓库中只能为 `true`；私有笔记不得先进入仓库再依赖前端隐藏。
- `aliases`、`tags`、`subcategories`、`prerequisites`、`related`、`next` 是字符串数组。
- 标题、别名、文件 slug 必须能唯一定位条目。
- 日期采用 `YYYY-MM-DD`，时区按 `Asia/Shanghai` 解释。
- 图片嵌入 `![[image.png]]` 对应 `public/wiki-assets/image.png`。

## Wikilink

- `[[线性回归]]`：链接到条目。
- `[[线性回归|回归模型]]`：用别名显示。
- `[[线性回归#梯度下降求解]]`：链接到标题锚点。
- `![[image.png]]`：嵌入公开资源。
