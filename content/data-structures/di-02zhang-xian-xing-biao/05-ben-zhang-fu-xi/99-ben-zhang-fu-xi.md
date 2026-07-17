---
title: 线性表本章复习
aliases: []
description: 顺序表： 连续存储，按下标 O(1) 插入右移：从后向前 删除左移：从前向后
category: 数据结构
subcategories:
  - 线性表
  - 本章复习
tags:
  - 数据结构
  - 线性表
  - 本章复习
  - 自测
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

顺序表： 连续存储，按下标 O(1) 插入右移：从后向前 删除左移：从前向后

上级知识点：本章目录

## 1. 一页速记

```text
线性表：
有限序列，一对一关系

顺序表：
连续存储，按下标 O(1)
插入右移：从后向前
删除左移：从前向后

单链表：
结点分散，next 表示后继
插入：新结点先接后面
删除：先保存、再绕过、后释放

循环链表：
尾结点回到起点，不以 NULL 结束

双向链表：
prior + next，双向维护
```

## 2. 关键边界

| 操作 | 合法条件 |
|---|---|
| 顺序表读取/删除 | $0\le index<length$ |
| 顺序表插入 | $0\le index\le length$ |
| 顺序表可插入 | $length<MAX\_SIZE$ |
| 普通带头结点空链表 | `head->next == NULL` |
| 循环带头结点空链表 | `head->next == head` |
| 单链表删除后继 | `p != NULL && p->next != NULL` |

## 3. 判断题

1. 线性表中的元素值不能重复。（ ）
2. 顺序表按值查找一定为 $O(1)$。（ ）
3. 顺序表在表尾插入时不需要移动元素。（ ）
4. 单链表结点必须按地址递增顺序存放。（ ）
5. 已知前驱时，单链表插入可为 $O(1)$。（ ）
6. 按下标在单链表插入一定为 $O(1)$。（ ）
7. 带头结点空链表中 `head == NULL`。（ ）
8. 循环链表可以用 `current != NULL` 遍历一圈。（ ）
9. 双向链表删除已知结点时仍必须从头寻找前驱。（ ）
10. 有序链表原地合并可使用 $O(1)$ 辅助空间。（ ）

答案：

```text
1. 错  2. 错  3. 对  4. 错  5. 对
6. 错  7. 错  8. 错  9. 错  10. 对
```

## 4. 指针纠错

### 题 1

```c
p->next = newNode;
newNode->next = p->next;
```

错误：第二句读取到的 `p->next` 已经是 `newNode`，形成自环。

正确：

```c
newNode->next = p->next;
p->next = newNode;
```

### 题 2

```c
p->next = p->next->next;
```

问题：目标结点地址丢失，无法 `free`。

正确：

```c
Node *target = p->next;
p->next = target->next;
free(target);
```

### 题 3

```c
free(current);
current = current->next;
```

问题：释放后访问 `current->next`。

正确：

```c
Node *nextNode = current->next;
free(current);
current = nextNode;
```

## 5. 算法题

1. 写出顺序表在下标 `index` 插入元素的算法。
2. 写出带头结点单链表按下标删除的算法。
3. 分别使用头插法与尾插法建立单链表。
4. 合并两个有序顺序表，保留重复值。
5. 原地合并两个有序单链表。
6. 写出循环链表遍历算法。
7. 写出双向链表删除已知结点的算法。

## 6. 复杂度题

| 操作 | 复杂度 |
|---|---:|
| 顺序表按下标访问 | $O(1)$ |
| 顺序表无序按值查找 | $O(n)$ |
| 顺序表表头插入 | $O(n)$ |
| 顺序表表尾插入 | $O(1)$ |
| 单链表按下标访问 | $O(n)$ |
| 单链表已知前驱插入 | $O(1)$ |
| 单链表按位置插入 | $O(n)$ |
| 维护尾指针的尾插建表 | $O(n)$ |
| 不维护尾指针的尾插建表 | $O(n^2)$ |
| 合并两个有序表 | $O(m+n)$ |

## 7. 对话驱动薄弱点

- [ ] 能否准确区分 `length`、容量和尾元素下标？
- [ ] 能否不看答案说明顺序表移动方向？
- [ ] 能否画出插入两条指针语句的中间状态？
- [ ] 能否解释为什么删除必须保存目标结点？
- [ ] 能否区分头指针、头结点、首元结点和尾指针？
- [ ] 能否说明“链表插入快”的完整前提？
- [ ] 能否独立写出有序顺序表和有序链表合并？
- [ ] 能否正确处理空表、表头、表尾和唯一结点？

## 8. LeetCode 练习路线

| 题目 | 训练重点 |
|---|---|
| [707. 设计链表](https://leetcode.cn/problems/design-linked-list/) | 完整链表接口与边界 |
| [203. 移除链表元素](https://leetcode.cn/problems/remove-linked-list-elements/) | 头结点与删除 |
| [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/) | 链接重定向 |
| [21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/) | 双指针与原地合并 |
| [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/) | 环与快慢指针 |
| [876. 链表的中间结点](https://leetcode.cn/problems/middle-of-the-linked-list/) | 快慢指针 |
| [160. 相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/) | 指针同步与结点身份 |

## 9. 下一章衔接

栈和队列都是受限线性表：

```text
线性表
├── 栈：只在一端插入和删除
└── 队列：一端插入，另一端删除
```

本章的顺序存储与链式存储思想，会直接产生顺序栈、链栈、顺序队列和链队列。
