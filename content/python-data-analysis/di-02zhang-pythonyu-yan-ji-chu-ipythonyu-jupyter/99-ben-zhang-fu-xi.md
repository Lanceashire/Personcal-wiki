---
title: Python语言基础、IPython与Jupyter · 本章复习
aliases: []
description: 第二章的重点不是“会背语法”，而是能稳定判断 Python 代码如何执行、变量如何绑定对象、可变对象何时被原地修改、字符串和 None 如何安全处理。这些能力会直接迁移到 NumPy 和 pandas。
category: Python 与数据分析
subcategories:
  - Python语言基础、IPython与Jupyter
tags:
  - Python 与数据分析
  - Python语言基础、IPython与Jupyter
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

第二章的重点不是“会背语法”，而是能稳定判断 Python 代码如何执行、变量如何绑定对象、可变对象何时被原地修改、字符串和 None 如何安全处理。这些能力会直接迁移到 NumPy 和 pandas。

## 核心结论

第二章的重点不是“会背语法”，而是能稳定判断 Python 代码如何执行、变量如何绑定对象、可变对象何时被原地修改、字符串和 `None` 如何安全处理。这些能力会直接迁移到 NumPy 和 pandas。

## 运行结果判断题

### 题 1：赋值与身份

```python
a = [10, 20]
b = a
c = [10, 20]

print(a == b)
print(a is b)
print(a == c)
print(a is c)
```

### 题 2：浅拷贝与嵌套列表

```python
a = [[1], [2]]
b = a.copy()
b[0].append(9)
b[1] = [8]

print(a)
print(b)
print(a[0] is b[0])
print(a[1] is b[1])
```

### 题 3：切片赋值

```python
a = list("ABCDEFG")
a[::3] = ["X", "Y", "Z"]
print(a)

b = list("ABCDEFG")
b[5:1:-2] = ["X", "Y"]
print(b)
```

### 题 4：字符串、None 与短路

```python
data = [" Python ", None, "", "  ", "NumPy"]

result = [
    x.strip().lower()
    for x in data
    if x is not None and x.strip()
]

print(result)
```

## 等价改写题

把下面循环改成列表推导式：

```python
result = []
for row in matrix:
    for x in row:
        if x is not None and x > 0 and x % 2 == 0:
            result.append(x ** 2)
```

## 独立代码编写题

给定：

```python
records = [
    {"name": " 张三 ", "score": 85},
    {"name": "", "score": 90},
    {"name": None, "score": 70},
    {"name": " 李四", "score": 0},
    {"name": "王五 ", "score": 92},
]
```

要求：筛选出 `score > 0` 且 `name` 不是 `None`、不是空白字符串的学生姓名，并把姓名两端空白去掉。

## 参考答案

### 题 1

```text
True
True
True
False
```

### 题 2

```python
[[1, 9], [2]]
[[1, 9], [8]]
True
False
```

### 题 3

```python
['X', 'B', 'C', 'Y', 'E', 'F', 'Z']
['A', 'B', 'C', 'Y', 'E', 'X', 'G']
```

### 题 4

```python
["python", "numpy"]
```

### 等价改写

```python
result = [
    x ** 2
    for row in matrix
    for x in row
    if x is not None and x > 0 and x % 2 == 0
]
```

### 独立代码

```python
result = [
    student["name"].strip()
    for student in records
    if student["score"] > 0
    and student["name"] is not None
    and student["name"].strip()
]
```

## 复习清单

- [ ] 能解释 Python 解释器和运行时错误。
- [ ] 能使用 Notebook 验证小段代码，并警惕 kernel 状态。
- [ ] 能区分变量绑定、值相等、对象身份。
- [ ] 能判断可变对象和不可变对象的行为差异。
- [ ] 能安全处理 `None`、空字符串和空白字符串。
- [ ] 能读写基础控制流和列表推导式。
- [ ] 能完成浅拷贝、切片赋值和列表方法综合题。
