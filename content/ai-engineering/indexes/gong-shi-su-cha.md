---
title: 公式速查
aliases: []
description: 公式速查是AI 工程知识体系中的一个条目，本文整理其核心概念、原理、示例与应用边界。
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
  - 线性代数做题技巧总表
next: []
---

## 条目概览

公式速查是AI 工程知识体系中的一个条目，本文整理其核心概念、原理、示例与应用边界。

> [!tip] 做题总表
> 更完整的线性代数题型、步骤和检查表见 [[线性代数做题技巧总表|线性代数做题技巧总表]]。

| 主题 | 公式 | 说明 |
| --- | --- | --- |
| 编码函数 | $\ph[本地路径已移除]
| L2 范数 | $\|x\|_2=\sqrt{\sum_{i=1}^{n}x_i^2}$ | 向量长度 |
| 单位化 | $\hat{x}=x/\|x\|_2$ | 非零向量归一化 |
| 点积 | $u\cdot v=\sum_{i=1}^{n}u_iv_i$ | 加权匹配或方向对齐 |
| 点积几何式 | $u\cdot v=\|u\|\|v\|\cos\theta$ | 连接点积与夹角 |
| 余弦相似度 | $\operatorname{cos\_sim}(u,v)=\frac{u\cdot v}{\|u\|\|v\|}$ | 主要衡量方向相似度 |
| 矩阵乘向量形状 | $W\in\mathbb{R}^{m\times n},x\in\mathbb{R}^{n}\Rightarrow Wx\in\mathbb{R}^m$ | 输出维度等于矩阵行数 |
| 矩阵列视角 | $A[x,y]^T=xAe_1+yAe_2$ | 第 $j$ 列等于 $Ae_j$，表示原第 $j$ 个坐标轴的去向 |
| 线性层 | $y=Wx+b$ | 神经网络常见线性部分 |
| 梯度下降 | $\theta_{\text{new}}=\theta_{\text{old}}-\eta\nabla L(\theta_{\text{old}})$ | 沿负梯度方向更新参数 |
| MSE | $\operatorname{MSE}(w,b)=\frac{1}{n}\sum_{i=1}^{n}[y_i-(wx_i+b)]^2$ | 平均平方预测误差 |
| 最小二乘 | $\min_\theta\|y-X\theta\|_2^2$ | 寻找让残差平方和最小的参数 |
| 投影 | $\operatorname{proj}_{\mathbf b}\mathbf a=\frac{\mathbf a\cdot\mathbf b}{\mathbf b\cdot\mathbf b}\mathbf b$ | 投影到谁身上，最后乘谁 |
| 二阶行列式 | $\det\begin{bmatrix}a&b\\c&d\end{bmatrix}=ad-bc$ | 判断可逆、求特征值常用 |
| 二阶逆矩阵 | $A^{-1}=\frac1{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$ | 前提是 $ad-bc\neq0$ |
| 秩判断 | $r(A)\leq\min(m,n)$ | 阶梯形非零行数是秩 |
| 特征值 | $\det(A-\lambda I)=0$ | 只在主对角线上减 $\lambda$ |
| 特征向量 | $(A-\lambda I)\mathbf v=0$ | 对每个特征值求非零解 |
