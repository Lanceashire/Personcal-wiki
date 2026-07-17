---
title: AI 工程 · 术语表
aliases: []
description: 术语表是AI 工程知识体系中的一个条目，本文整理其核心概念、原理、示例与应用边界。
category: AI 工程
subcategories: []
tags:
  - AI 工程
type: reference
difficulty: beginner
status: developing
public: true
created: 2026-07-17
updated: 2026-07-17
prerequisites: []
related:
  - 向量为什么是 AI 的输入语言
  - 向量长度、方向、加法与数乘
  - 点积：从加权评分到相似度
  - 矩阵作为线性变换与神经网络层
  - 拟合、MSE 与偏置插入讲解
next: []
---

## 条目概览

术语表是AI 工程知识体系中的一个条目，本文整理其核心概念、原理、示例与应用边界。

| 术语 | 英文 | 简明解释 | 首次出现 |
| --- | --- | --- | --- |
| 向量 | vector | 固定顺序的数值列表，可表示点或方向 | [[向量为什么是 AI 的输入语言]] |
| 编码函数 | encoding function | 把现实对象映射到数值向量的函数 $\phi:X\to\mathbb{R}^n$ | [[向量为什么是 AI 的输入语言]] |
| embedding | embedding | 训练得到的对象向量表示 | [[向量为什么是 AI 的输入语言]] |
| L2 范数 | L2 norm | 向量长度 $\|x\|_2=\sqrt{\sum_i x_i^2}$ | [[向量长度、方向、加法与数乘]] |
| 单位向量 | unit vector | 长度为 1 的向量 | [[向量长度、方向、加法与数乘]] |
| 点积 | dot product | 逐维相乘求和，既可看作加权评分，也可衡量方向对齐 | [[点积：从加权评分到相似度]] |
| 余弦相似度 | cosine similarity | 点积除以两个范数，主要比较方向相似度 | [[点积：从加权评分到相似度]] |
| 正交 | orthogonal | 非零向量点积为 0，夹角为 $90^\circ$ | [[点积：从加权评分到相似度]] |
| 矩阵 | matrix | 数字表，也可看成把向量映射到新向量的变换 | [[矩阵作为线性变换与神经网络层]] |
| 线性变换 | linear transformation | 满足加法保持和数乘保持的变换 $T(x)=Wx$ | [[矩阵作为线性变换与神经网络层]] |
| 仿射变换 | affine transformation | 线性变换加平移，形式为 $Wx+b$ | [[矩阵作为线性变换与神经网络层]] |
| 偏置 | bias | 模型中的平移项，使输出不必经过原点 | [[矩阵作为线性变换与神经网络层]] |
| 拟合 | fitting | 选择参数，使预测与训练数据误差尽量小 | [[拟合、MSE 与偏置插入讲解]] |
| MSE | mean squared error | 平均平方误差 $\frac1n\sum_i(y_i-\hat y_i)^2$ | [[拟合、MSE 与偏置插入讲解]] |
