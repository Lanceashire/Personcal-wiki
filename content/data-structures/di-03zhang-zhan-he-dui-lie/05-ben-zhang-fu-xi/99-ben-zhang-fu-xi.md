---
title: 栈和队列本章复习
aliases: []
description: 栈：同一端插入删除，LIFO 顺序栈：top=-1 为空 链栈：栈顶放链表头部
category: 数据结构
subcategories:
  - 栈和队列
  - 本章复习
tags:
  - 数据结构
  - 栈和队列
  - 本章复习
  - 栈
  - 队列
  - 自测
type: reference
difficulty: intermediate
status: complete
public: true
created: 2026-07-17
updated: 2026-07-17
prerequisites: []
related:
  - 栈和队列LeetCode练习路线
  - 栈和队列C语言代码模板速查
next: []
---

## 条目概览

栈：同一端插入删除，LIFO 顺序栈：top=-1 为空 链栈：栈顶放链表头部

上级知识点：本章目录

## 1. 一页速记

```text
栈：同一端插入删除，LIFO
顺序栈：top=-1 为空
链栈：栈顶放链表头部

括号匹配：
左括号入栈，右括号匹配栈顶，结束时栈空

后缀求值：
操作数入栈，运算符弹出 right 再弹出 left

队列：队尾入，队头出，FIFO
循环队列：
空 front==rear
满 (rear+1)%capacity==front
长度 (rear-front+capacity)%capacity

链队列：
front、rear 初始都指向头结点
删除最后结点后 rear=front
```

## 2. 高频公式

在循环队列“牺牲一个位置”的约定下：

$$
empt[本地路径已移除]
$$

$$
ful[本地路径已移除]
$$

$$
length=(rear-front+capacity)\bmod capacity
$$

最大有效元素数：

$$
capacity-1
$$

## 3. 判断题

1. 栈只能在栈顶插入，但可以在栈底删除。（ ）
2. `top` 一定表示栈顶元素值。（ ）
3. 链栈入栈和出栈通常都是 $O(1)$。（ ）
4. 括号数量相等就一定匹配。（ ）
5. 后缀表达式减法时先弹出左操作数。（ ）
6. 递归空间只取决于函数总调用次数。（ ）
7. 普通顺序队列可能产生假溢出。（ ）
8. 循环队列的 `front == rear` 可同时表示空和满而无需额外信息。（ ）
9. 带头结点链队列空时 `front == rear`。（ ）
10. 链队列删除最后结点后无需修改 `rear`。（ ）

答案：

```text
1错 2错 3对 4错 5错
6错 7对 8错 9对 10错
```

## 4. 简答题

1. 为什么链栈的栈顶放在链表头部？
2. 括号匹配的栈中保存什么？
3. 后缀表达式为什么不需要括号？
4. 递归调用为什么使用栈管理？
5. 什么是假溢出？
6. 循环队列为什么需要模运算？
7. 为什么空和满状态需要额外区分策略？
8. 链队列最后一个结点出队时为什么要更新队尾？
9. BFS 为什么使用队列？
10. 两个栈如何实现队列？

## 5. 代码纠错

### 顺序栈

错误：

```c
stack->data[stack->top++] = value;
```

若 `top` 指向当前栈顶且初值为 `-1`，会访问 `data[-1]`。

正确：

```c
stack->data[++stack->top] = value;
```

### 链栈

错误：

```c
stack->top = newNode;
newNode->next = stack->top;
```

会让新结点指向自身。

正确：

```c
newNode->next = stack->top;
stack->top = newNode;
```

### 链队列

错误：

```c
queue->front->next = target->next;
free(target);
```

若 `target` 是唯一数据结点，`rear` 仍悬空。

正确补充：

```c
if (queue->rear == target) {
    queue->rear = queue->front;
}
```

## 6. 计算题

循环队列容量为 `8`，采用牺牲一个位置方案。

### 题 1

```text
front = 6, rear = 2
```

长度：

$$
(2-6+8)\bmod8=4
$$

### 题 2

```text
front = 3, rear = 2
```

判满：

$$
(2+1)\bmod8=3=front
$$

因此队满，有效元素数为 `7`。

## 7. 薄弱点检查

- [ ] 能否明确说出 `top` 的约定？
- [ ] 能否写出链栈入栈和出栈的安全顺序？
- [ ] 能否列出括号匹配三类失败？
- [ ] 能否正确区分后缀运算左右操作数？
- [ ] 能否画出递归压栈和回归过程？
- [ ] 能否独立推导循环队列三个公式？
- [ ] 能否处理链队列最后一个结点出队？
- [ ] 能否解释两个栈实现队列的均摊复杂度？

## 8. 练习入口

- [[栈和队列LeetCode练习路线]]
- [[栈和队列C语言代码模板速查]]

## 9. 下一章衔接

后续串、数组与广义表仍会用到线性存储思想；树的非递归遍历依赖栈，层序遍历依赖队列；图的 DFS 和 BFS 更会直接复用本章结构。
