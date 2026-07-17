import { getWikiSlug, type WikiEntry } from './graph';

export interface WikiNavigationNode {
  id: string;
  label: string;
  count: number;
  active: boolean;
  entries: WikiEntry[];
  children: WikiNavigationNode[];
}

interface MutableNavigationNode {
  id: string;
  label: string;
  orderKey: string;
  entries: WikiEntry[];
  children: Map<string, MutableNavigationNode>;
}

function compareOrder(left: string, right: string): number {
  return left.localeCompare(right, 'zh-CN', { numeric: true });
}

function createMutableNode(id: string, label: string, orderKey: string): MutableNavigationNode {
  return { id, label, orderKey, entries: [], children: new Map() };
}

function finalizeNode(node: MutableNavigationNode, activeId?: string): WikiNavigationNode {
  const entries = [...node.entries].sort((left, right) => compareOrder(getWikiSlug(left), getWikiSlug(right)));
  const children = [...node.children.values()].sort((left, right) => compareOrder(left.orderKey, right.orderKey));
  const finalizedChildren = children.map((child) => finalizeNode(child, activeId));
  const active = entries.some((entry) => entry.id === activeId) || finalizedChildren.some((child) => child.active);

  return {
    id: node.id,
    label: node.label,
    count: entries.length + finalizedChildren.reduce((total, child) => total + child.count, 0),
    active,
    entries,
    children: finalizedChildren,
  };
}

/** Build an Obsidian-style navigation tree from category and subcategory metadata. */
export function buildWikiNavigationTree(entries: WikiEntry[], activeId?: string): WikiNavigationNode[] {
  const roots = new Map<string, MutableNavigationNode>();

  for (const entry of entries) {
    const orderKey = getWikiSlug(entry);
    const category = entry.data.category.trim();
    let node = roots.get(category);
    if (!node) {
      node = createMutableNode(category, category, orderKey);
      roots.set(category, node);
    } else if (compareOrder(orderKey, node.orderKey) < 0) {
      node.orderKey = orderKey;
    }

    const path = entry.data.subcategories.map((part) => part.trim()).filter(Boolean);
    for (const part of path) {
      const id = `${node.id}/${part}`;
      let child = node.children.get(part);
      if (!child) {
        child = createMutableNode(id, part, orderKey);
        node.children.set(part, child);
      } else if (compareOrder(orderKey, child.orderKey) < 0) {
        child.orderKey = orderKey;
      }
      node = child;
    }

    node.entries.push(entry);
  }

  return [...roots.values()]
    .sort((left, right) => compareOrder(left.orderKey, right.orderKey))
    .map((root) => finalizeNode(root, activeId));
}
