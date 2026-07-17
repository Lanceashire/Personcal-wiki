import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KnowledgeGraphData } from '../../lib/wiki/graph';

interface Props extends KnowledgeGraphData {
  focusId?: string;
  compact?: boolean;
}

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const WIDTH = 1000;
const HEIGHT = 620;
const categoryColors = ['#ef8fbd', '#8eafee', '#79c9b4', '#e6b66d', '#a998e8', '#7ec5e8', '#e48e86'];

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

function initialPoint(id: string, index: number, total: number, focus: boolean): Point {
  if (focus) return { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0 };
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 + (hash(id) % 100) / 100;
  const radius = 90 + (hash(`${id}-radius`) % 190);
  return { x: WIDTH / 2 + Math.cos(angle) * radius, y: HEIGHT / 2 + Math.sin(angle) * radius, vx: 0, vy: 0 };
}

export default function KnowledgeGraph({ nodes, edges, focusId, compact = false }: Props) {
  const categories = useMemo(() => [...new Set(nodes.map((node) => node.category))].sort(), [nodes]);
  const colors = useMemo(
    () => new Map(categories.map((category, index) => [category, categoryColors[index % categoryColors.length]])),
    [categories],
  );
  const [category, setCategory] = useState('全部领域');
  const [query, setQuery] = useState('');
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const positionsRef = useRef<Record<string, Point>>({});
  const [hovered, setHovered] = useState<string>();
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef<{ mode: 'canvas' | 'node'; id?: string; x: number; y: number } | undefined>(undefined);
  const svgRef = useRef<SVGSVGElement>(null);

  const visibleNodes = useMemo(
    () => (category === '全部领域' ? nodes : nodes.filter((node) => node.category === category || node.id === focusId)),
    [category, focusId, nodes],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleEdges = useMemo(
    () => edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
    [edges, visibleIds],
  );
  const neighbors = useMemo(() => {
    const result = new Map<string, Set<string>>();
    for (const edge of visibleEdges) {
      if (!result.has(edge.source)) result.set(edge.source, new Set());
      if (!result.has(edge.target)) result.set(edge.target, new Set());
      result.get(edge.source)?.add(edge.target);
      result.get(edge.target)?.add(edge.source);
    }
    return result;
  }, [visibleEdges]);

  useEffect(() => {
    let frame = 0;
    let animation = 0;
    const points: Record<string, Point> = {};
    visibleNodes.forEach((node, index) => {
      points[node.id] = positionsRef.current[node.id] ?? initialPoint(node.id, index, visibleNodes.length, node.id === focusId);
    });
    const tick = () => {
      frame += 1;
      const values = visibleNodes.map((node) => points[node.id]);
      const repulsion = visibleNodes.length > 80 ? 1150 : 1900;
      for (let i = 0; i < values.length; i += 1) {
        for (let j = i + 1; j < values.length; j += 1) {
          const a = values[i];
          const b = values[j];
          const dx = a.x - b.x || 0.1;
          const dy = a.y - b.y || 0.1;
          const distanceSquared = Math.max(dx * dx + dy * dy, 90);
          const force = repulsion / distanceSquared;
          a.vx += dx * force;
          a.vy += dy * force;
          b.vx -= dx * force;
          b.vy -= dy * force;
        }
      }
      for (const edge of visibleEdges) {
        const source = points[edge.source];
        const target = points[edge.target];
        if (!source || !target) continue;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const desired = compact ? 135 : 92;
        const force = (distance - desired) * 0.0035;
        source.vx += (dx / distance) * force;
        source.vy += (dy / distance) * force;
        target.vx -= (dx / distance) * force;
        target.vy -= (dy / distance) * force;
      }
      for (const node of visibleNodes) {
        const point = points[node.id];
        point.vx += (WIDTH / 2 - point.x) * 0.0008;
        point.vy += (HEIGHT / 2 - point.y) * 0.0008;
        point.vx *= 0.82;
        point.vy *= 0.82;
        point.x = Math.max(24, Math.min(WIDTH - 24, point.x + point.vx));
        point.y = Math.max(24, Math.min(HEIGHT - 24, point.y + point.vy));
        if (node.id === focusId) {
          point.x += (WIDTH / 2 - point.x) * 0.12;
          point.y += (HEIGHT / 2 - point.y) * 0.12;
        }
      }
      if (frame % 3 === 0 || frame === 1) {
        positionsRef.current = { ...points };
        setPositions(positionsRef.current);
      }
      if (frame < 150) animation = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animation);
  }, [visibleNodes, visibleEdges, focusId, compact]);

  const toGraphPoint = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const activeDrag = drag.current;
    if (!activeDrag) return;
    const point = toGraphPoint(event);
    if (activeDrag.mode === 'node' && activeDrag.id) {
      const id = activeDrag.id;
      const next = { ...positionsRef.current, [id]: { x: point.x, y: point.y, vx: 0, vy: 0 } };
      positionsRef.current = next;
      setPositions(next);
    } else {
      setTransform((current) => ({ ...current, x: current.x + point.x - activeDrag.x, y: current.y + point.y - activeDrag.y }));
      activeDrag.x = point.x;
      activeDrag.y = point.y;
    }
  };

  const active = hovered ?? focusId;
  const isDimmed = (id: string) => {
    const searchMiss =
      query.trim() &&
      !nodes
        .find((node) => node.id === id)
        ?.title.toLocaleLowerCase('zh-CN')
        .includes(query.trim().toLocaleLowerCase('zh-CN'));
    if (searchMiss) return true;
    return Boolean(active && id !== active && !neighbors.get(active)?.has(id));
  };

  return (
    <div className={`knowledge-graph ${compact ? 'knowledge-graph--compact' : ''}`}>
      <div className="knowledge-graph__toolbar">
        <label>
          <span className="sr-only">搜索知识点</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索知识点…" />
        </label>
        {!compact && (
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="筛选知识领域">
            <option>全部领域</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        )}
        <button type="button" onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}>
          重置视图
        </button>
        <span>
          {visibleNodes.length} 个知识点 · {visibleEdges.length} 条连接
        </span>
      </div>
      <svg
        ref={svgRef}
        className="knowledge-graph__canvas"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="可交互知识图谱；点击节点打开知识条目"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            const point = toGraphPoint(event);
            drag.current = { mode: 'canvas', ...point };
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          drag.current = undefined;
        }}
        onPointerCancel={() => {
          drag.current = undefined;
        }}
        onWheel={(event) => {
          event.preventDefault();
          setTransform((current) => ({
            ...current,
            scale: Math.max(0.55, Math.min(2.4, current.scale * (event.deltaY > 0 ? 0.9 : 1.1))),
          }));
        }}
      >
        <defs>
          <marker id="knowledge-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" />
          </marker>
          <filter id="knowledge-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          {visibleEdges.map((edge) => {
            const source = positions[edge.source];
            const target = positions[edge.target];
            if (!source || !target) return null;
            const emphasized = active === edge.source || active === edge.target;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                className={`knowledge-edge knowledge-edge--${edge.kind}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                markerEnd={edge.kind === 'related' || edge.kind === 'mention' ? undefined : 'url(#knowledge-arrow)'}
                opacity={active && !emphasized ? 0.08 : emphasized ? 0.9 : 0.28}
              />
            );
          })}
          {visibleNodes.map((node) => {
            const point = positions[node.id];
            if (!point) return null;
            const focused = node.id === focusId;
            const dimmed = isDimmed(node.id);
            return (
              <a
                key={node.id}
                href={node.url}
                className="knowledge-node"
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(undefined)}
                aria-label={`${node.title}，${node.category}`}
              >
                <g
                  transform={`translate(${point.x} ${point.y})`}
                  opacity={dimmed ? 0.16 : 1}
                  filter={focused ? 'url(#knowledge-glow)' : undefined}
                  onPointerDown={(event) => {
                    const graphPoint = toGraphPoint(event as unknown as React.PointerEvent<SVGSVGElement>);
                    drag.current = { mode: 'node', id: node.id, ...graphPoint };
                    event.preventDefault();
                  }}
                >
                  <circle
                    r={focused ? 11 : 7}
                    fill={colors.get(node.category)}
                    stroke="var(--knowledge-node-stroke)"
                    strokeWidth={focused ? 3 : 1.5}
                  />
                  {(focused || hovered === node.id || query) && (
                    <text x="13" y="4">
                      {node.title}
                    </text>
                  )}
                </g>
              </a>
            );
          })}
        </g>
      </svg>
      <ul className="knowledge-graph__legend" aria-label="图例">
        {categories.map((item) => (
          <li key={item}>
            <i style={{ background: colors.get(item) }} />
            {item}
          </li>
        ))}
        <li>
          <b className="knowledge-graph__line knowledge-graph__line--solid" />
          学习顺序
        </li>
        <li>
          <b className="knowledge-graph__line knowledge-graph__line--dashed" />
          相关/引用
        </li>
      </ul>
    </div>
  );
}
