---
title: 数据结构外部资源
aliases: []
description: 数据结构外部资源是数据结构知识体系中的一个条目，本文整理其核心概念、原理、示例与应用边界。
category: 数据结构
subcategories: []
tags:
  - 数据结构
  - 外部资源
  - index
type: reference
difficulty: beginner
status: complete
public: true
created: 2026-07-17
updated: 2026-07-17
prerequisites: []
related: []
next: []
---

## 条目概览

数据结构外部资源是数据结构知识体系中的一个条目，本文整理其核心概念、原理、示例与应用边界。

> [!note]
> 这里只收录能直接辅助理解、练习或核对的资源，不堆积无用途链接。

## 通用资源

| 类型 | 资源 | 用途 |
|---|---|---|
| visualization | [VisuAlgo](https://visualgo.net/zh) | 动态观察链表、树、图、查找和排序过程 |
| practice | [LeetCode 中国站](https://leetcode.cn/) | 使用代码题练习数据结构操作与复杂度分析 |
| complexity | [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) | 快速对照常见结构与算法的复杂度 |
| C reference | [cppreference C](https://en.cppreference.com/w/c) | 核对 C 语言语法、动态内存和标准库接口 |

## 线性表练习

| 类型 | 资源 | 用途 |
|---|---|---|
| practice | [LeetCode 707：设计链表](https://leetcode.cn/problems/design-linked-list/) | 综合练习链表接口、尾指针和边界条件 |
| practice | [LeetCode 21：合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/) | 练习有序链表原地合并 |
| practice | [LeetCode 206：反转链表](https://leetcode.cn/problems/reverse-linked-list/) | 强化指针保存与链接重定向 |
| visualization | [VisuAlgo Linked List](https://visualgo.net/zh/list) | 动态观察插入、删除和结点连接 |

## 栈和队列练习

| 类型 | 资源 | 用途 |
|---|---|---|
| practice | [LeetCode 20：有效的括号](https://leetcode.cn/problems/valid-parentheses/) | 栈的基础匹配应用 |
| practice | [LeetCode 150：逆波兰表达式求值](https://leetcode.cn/problems/evaluate-reverse-polish-notation/) | 操作数栈与表达式求值 |
| practice | [LeetCode 232：用栈实现队列](https://leetcode.cn/problems/implement-queue-using-stacks/) | 理解两次反转与均摊复杂度 |
| practice | [LeetCode 622：设计循环队列](https://leetcode.cn/problems/design-circular-queue/) | 练习front、rear与判空判满 |
| practice | [LeetCode 739：每日温度](https://leetcode.cn/problems/daily-temperatures/) | 单调栈入门 |
| practice | [LeetCode 239：滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/) | 单调双端队列进阶 |

## 串与KMP练习

| 类型 | 资源 | 用途 |
|---|---|---|
| practice | [LeetCode 28：第一个匹配项](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/) | 朴素匹配与KMP主模板 |
| practice | [LeetCode 459：重复的子字符串](https://leetcode.cn/problems/repeated-substring-pattern/) | 使用前缀函数判断周期 |
| practice | [LeetCode 1392：最长快乐前缀](https://leetcode.cn/problems/longest-happy-prefix/) | 直接理解`pi[n-1]` |
| practice | [LeetCode 796：旋转字符串](https://leetcode.cn/problems/rotate-string/) | 子串匹配在旋转判断中的应用 |
| practice | [LeetCode 214：最短回文串](https://leetcode.cn/problems/shortest-palindrome/) | KMP组合串进阶 |

## 使用原则

1. 先理解教材和笔记中的概念，再用可视化验证过程。
2. 刷题时记录错误原因，不只记录是否通过。
3. 外部代码模板必须核对边界条件和内存释放。
4. 复杂度表只能用于复核，不能代替推导。
