---
title: 预备知识 · 本章复习
aliases: []
description: 第 1 章的任务是建立学习地图：数据分析的完整流程、Python 的工具定位、核心库生态、环境配置和后续阅读路线。它不要求立刻掌握 pandas API，但要求知道为什么后续要学 NumPy、pandas、Matplotlib，以及为什么 Python 基础机制不能跳过。
category: Python 与数据分析
subcategories:
  - 预备知识
tags:
  - Python 与数据分析
  - 预备知识
type: reference
difficulty: intermediate
status: complete
public: true
created: 2026-07-17
updated: 2026-07-17
prerequisites: []
related: []
next: []
---

## 条目概览

第 1 章的任务是建立学习地图：数据分析的完整流程、Python 的工具定位、核心库生态、环境配置和后续阅读路线。它不要求立刻掌握 pandas API，但要求知道为什么后续要学 NumPy、pandas、Matplotlib，以及为什么 Python 基础机制不能跳过。

## 核心结论

第 1 章的任务是建立学习地图：数据分析的完整流程、Python 的工具定位、核心库生态、环境配置和后续阅读路线。它不要求立刻掌握 pandas API，但要求知道为什么后续要学 NumPy、pandas、Matplotlib，以及为什么 Python 基础机制不能跳过。

## 本章高频检查点

- Python 适合数据分析的原因：表达力、生态、交互式探索、胶水能力。
- Python 的限制：纯 Python 循环和对象模型有额外开销，性能关键处应使用 NumPy 等库。
- 核心库分工：NumPy 数组、pandas 表格、Matplotlib 可视化、Jupyter 探索、SciPy 科学计算、scikit-learn 机器学习、statsmodels 统计建模。
- 环境配置目标：隔离依赖、保证 Notebook 与终端解释器一致。
- 后续复习重点：对象引用、浅拷贝、切片、推导式、空值处理。

## 判断题

1. Python 适合数据分析，所以任何大规模数值计算都应该用纯 Python 循环完成。
2. pandas 主要面向表格数据处理。
3. Jupyter Notebook 适合探索式分析，但正式项目仍需要注意代码组织。
4. `ModuleNotFoundError` 一定说明这个包没有安装在电脑上的任何地方。
5. 第一章知道库名就够了，后续 Python 基础可以跳过。

## 简答题

1. 为什么说 Python 可以缓解“双语言问题”？
2. NumPy 和 Python 列表在数值计算中的核心差异是什么？
3. 遇到 Notebook 里无法 `import pandas`，应如何排查？
4. 为什么第一章需要把对话中的切片、浅拷贝、推导式问题记录下来，但不直接展开成正文？

## 代码阅读题

```python
data = ["  Python  ", "", None, " NumPy ", "   "]

result = [
    x.strip().lower()
    for x in data
    if x is not None and x.strip()
]

print(result)
```

要求：

1. 写出输出结果。
2. 解释为什么 `x is not None` 必须放在 `x.strip()` 前面。
3. 说明这道题和后续 pandas 缺失值、字符串清洗有什么关系。

## 参考答案

### 判断题

1. 错。大规模数值计算应优先使用 NumPy 等底层优化库。
2. 对。
3. 对。
4. 错。也可能是当前解释器或 Notebook kernel 与安装包的环境不一致。
5. 错。Python 基础机制会直接影响后续 pandas 和 NumPy 学习。

### 简答题要点

1. Python 用高层语法表达分析逻辑，同时通过 NumPy、pandas、SciPy 等库调用底层高性能实现，减少“原型一种语言、生产另一种语言”的割裂。
2. Python 列表保存的是对象引用，灵活但开销较大；NumPy 数组通常保存同类型连续数据，更适合批量数值计算。
3. 检查当前 Python 解释器、conda 环境、Notebook kernel、包安装位置和包名拼写。
4. 因为 skill 要求保留教材层级。第一章是导论，具体语法机制应进入后续 Python 基础章节；但对话薄弱点应影响后续优先级。

### 代码题答案

```python
["python", "numpy"]
```

`None` 不是字符串，没有 `.strip()` 方法；`and` 从左到右短路求值，先排除 `None` 才能安全调用字符串方法。
