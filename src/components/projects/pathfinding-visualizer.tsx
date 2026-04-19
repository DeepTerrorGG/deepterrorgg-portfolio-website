'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── City Data ─────────────────────────────────────────────────────────
const CITIES = {
  lisbon:     { id: 'lisbon',     name: 'Lisbon',     x: 118,  y: 422 },
  madrid:     { id: 'madrid',     name: 'Madrid',     x: 210,  y: 390 },
  barcelona:  { id: 'barcelona',  name: 'Barcelona',  x: 295,  y: 368 },
  paris:      { id: 'paris',      name: 'Paris',      x: 338,  y: 278 },
  london:     { id: 'london',     name: 'London',     x: 285,  y: 218 },
  amsterdam:  { id: 'amsterdam',  name: 'Amsterdam',  x: 372,  y: 190 },
  brussels:   { id: 'brussels',   name: 'Brussels',   x: 365,  y: 228 },
  lyon:       { id: 'lyon',       name: 'Lyon',       x: 352,  y: 320 },
  marseille:  { id: 'marseille',  name: 'Marseille',  x: 368,  y: 362 },
  geneva:     { id: 'geneva',     name: 'Geneva',     x: 390,  y: 312 },
  zurich:     { id: 'zurich',     name: 'Zürich',     x: 412,  y: 300 },
  frankfurt:  { id: 'frankfurt',  name: 'Frankfurt',  x: 428,  y: 240 },
  hamburg:    { id: 'hamburg',    name: 'Hamburg',    x: 430,  y: 170 },
  berlin:     { id: 'berlin',     name: 'Berlin',     x: 490,  y: 192 },
  copenhagen: { id: 'copenhagen', name: 'Copenhagen', x: 465,  y: 130 },
  oslo:       { id: 'oslo',       name: 'Oslo',       x: 430,  y: 75  },
  stockholm:  { id: 'stockholm',  name: 'Stockholm',  x: 510,  y: 88  },
  prague:     { id: 'prague',     name: 'Prague',     x: 490,  y: 240 },
  vienna:     { id: 'vienna',     name: 'Vienna',     x: 510,  y: 282 },
  munich:     { id: 'munich',     name: 'Munich',     x: 450,  y: 288 },
  milan:      { id: 'milan',      name: 'Milan',      x: 418,  y: 340 },
  rome:       { id: 'rome',       name: 'Rome',       x: 460,  y: 408 },
  warsaw:     { id: 'warsaw',     name: 'Warsaw',     x: 554,  y: 198 },
  budapest:   { id: 'budapest',   name: 'Budapest',   x: 542,  y: 298 },
  bucharest:  { id: 'bucharest',  name: 'Bucharest',  x: 600,  y: 348 },
  athens:     { id: 'athens',     name: 'Athens',     x: 562,  y: 462 },
} as const;

type CityId = keyof typeof CITIES;
type CityNode = typeof CITIES[CityId];

// ─── Edge Definitions ──────────────────────────────────────────────────
const EDGE_DEFS: [CityId, CityId][] = [
  ['lisbon', 'madrid'],
  ['madrid', 'barcelona'],
  ['madrid', 'paris'],
  ['barcelona', 'lyon'],
  ['barcelona', 'marseille'],
  ['paris', 'london'],
  ['paris', 'brussels'],
  ['paris', 'lyon'],
  ['paris', 'frankfurt'],
  ['london', 'amsterdam'],
  ['london', 'brussels'],
  ['amsterdam', 'brussels'],
  ['amsterdam', 'hamburg'],
  ['amsterdam', 'frankfurt'],
  ['brussels', 'frankfurt'],
  ['lyon', 'marseille'],
  ['lyon', 'geneva'],
  ['marseille', 'milan'],
  ['marseille', 'rome'],
  ['geneva', 'zurich'],
  ['geneva', 'milan'],
  ['zurich', 'frankfurt'],
  ['zurich', 'munich'],
  ['zurich', 'milan'],
  ['frankfurt', 'hamburg'],
  ['frankfurt', 'berlin'],
  ['frankfurt', 'munich'],
  ['frankfurt', 'prague'],
  ['hamburg', 'berlin'],
  ['hamburg', 'copenhagen'],
  ['berlin', 'copenhagen'],
  ['berlin', 'warsaw'],
  ['berlin', 'prague'],
  ['copenhagen', 'oslo'],
  ['copenhagen', 'stockholm'],
  ['oslo', 'stockholm'],
  ['prague', 'vienna'],
  ['prague', 'warsaw'],
  ['munich', 'vienna'],
  ['munich', 'milan'],
  ['vienna', 'budapest'],
  ['milan', 'rome'],
  ['warsaw', 'budapest'],
  ['warsaw', 'bucharest'],
  ['budapest', 'bucharest'],
  ['bucharest', 'athens'],
  ['rome', 'athens'],
];

// ─── Graph utilities ───────────────────────────────────────────────────
function dist(a: CityNode, b: CityNode) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function buildAdjacency() {
  const adj: Record<CityId, { city: CityId; weight: number }[]> = {} as never;
  for (const id of Object.keys(CITIES) as CityId[]) adj[id] = [];
  for (const [a, b] of EDGE_DEFS) {
    const w = dist(CITIES[a], CITIES[b]);
    adj[a].push({ city: b, weight: w });
    adj[b].push({ city: a, weight: w });
  }
  return adj;
}
const ADJ = buildAdjacency();

type AlgoResult = { visited: CityId[]; path: CityId[] };

function runDijkstra(start: CityId, end: CityId): AlgoResult {
  const dist: Record<string, number> = {};
  const prev: Record<string, CityId | null> = {};
  const visited: CityId[] = [];
  const unvisited = new Set(Object.keys(CITIES) as CityId[]);
  for (const id of unvisited) { dist[id] = Infinity; prev[id] = null; }
  dist[start] = 0;
  while (unvisited.size > 0) {
    let u: CityId | null = null;
    for (const v of unvisited) if (u === null || dist[v] < dist[u]) u = v;
    if (!u || dist[u] === Infinity) break;
    unvisited.delete(u);
    if (u !== start && u !== end) visited.push(u);
    if (u === end) break;
    for (const { city: v, weight } of ADJ[u]) {
      if (!unvisited.has(v)) continue;
      const alt = dist[u] + weight;
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
    }
  }
  const path: CityId[] = [];
  let cur: CityId | null = end;
  while (cur) { path.unshift(cur); cur = prev[cur] ?? null; }
  return { visited, path };
}

function runAStar(start: CityId, end: CityId): AlgoResult {
  const g: Record<string, number> = {};
  const f: Record<string, number> = {};
  const prev: Record<string, CityId | null> = {};
  const visited: CityId[] = [];
  const open = new Set<CityId>([start]);
  const closed = new Set<CityId>();
  for (const id of Object.keys(CITIES) as CityId[]) { g[id] = Infinity; prev[id] = null; }
  g[start] = 0;
  f[start] = dist(CITIES[start], CITIES[end]);
  while (open.size > 0) {
    let u: CityId | null = null;
    for (const v of open) if (u === null || (f[v] ?? Infinity) < (f[u] ?? Infinity)) u = v;
    if (!u) break;
    if (u === end) break;
    open.delete(u); closed.add(u);
    if (u !== start) visited.push(u);
    for (const { city: v, weight } of ADJ[u]) {
      if (closed.has(v)) continue;
      const tentative = g[u] + weight;
      if (tentative < g[v]) {
        prev[v] = u; g[v] = tentative;
        f[v] = g[v] + dist(CITIES[v], CITIES[end]);
        open.add(v);
      }
    }
  }
  const path: CityId[] = [];
  let cur: CityId | null = end;
  while (cur) { path.unshift(cur); cur = prev[cur] ?? null; }
  return { visited, path };
}

// ─── Component ─────────────────────────────────────────────────────────
type Status = 'idle' | 'running' | 'done';
type Algorithm = 'astar' | 'dijkstra';

const SVG_W = 720;
const SVG_H = 520;

export default function EuropePathfinder() {
  const [start, setStart] = useState<CityId | null>(null);
  const [end, setEnd]     = useState<CityId | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>('astar');
  const [status, setStatus] = useState<Status>('idle');
  const [visitedSet, setVisitedSet] = useState<Set<CityId>>(new Set());
  const [pathSet, setPathSet]       = useState<Set<CityId>>(new Set());
  const [pathEdges, setPathEdges]   = useState<Set<string>>(new Set());
  const [pathOrder, setPathOrder]   = useState<CityId[]>([]);
  const [visitedCount, setVisitedCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    setStart(null); setEnd(null); setStatus('idle');
    setVisitedSet(new Set()); setPathSet(new Set());
    setPathEdges(new Set()); setPathOrder([]); setVisitedCount(0);
  }, []);

  const handleCityClick = (id: CityId) => {
    if (status === 'running') return;
    if (status === 'done') { reset(); return; }
    if (!start) { setStart(id); return; }
    if (id === start) { setStart(null); return; }
    if (!end) { setEnd(id); return; }
    setEnd(id);
  };

  const run = useCallback(() => {
    if (!start || !end || status !== 'idle') return;
    clearTimers();
    setVisitedSet(new Set()); setPathSet(new Set());
    setPathEdges(new Set()); setPathOrder([]); setVisitedCount(0);
    setStatus('running');

    const result = algorithm === 'astar' ? runAStar(start, end) : runDijkstra(start, end);
    const VISIT_DELAY = 80;
    const PATH_DELAY = 120;

    result.visited.forEach((city, i) => {
      const t = setTimeout(() => {
        setVisitedSet(prev => new Set([...prev, city]));
        setVisitedCount(i + 1);
      }, i * VISIT_DELAY);
      timersRef.current.push(t);
    });

    const pathStart = result.visited.length * VISIT_DELAY;
    result.path.forEach((city, i) => {
      const t = setTimeout(() => {
        setPathSet(prev => new Set([...prev, city]));
        setPathOrder(prev => [...prev, city]);
        if (i > 0) {
          const key = [result.path[i - 1], city].sort().join('|');
          setPathEdges(prev => new Set([...prev, key]));
        }
        if (i === result.path.length - 1) setStatus('done');
      }, pathStart + i * PATH_DELAY);
      timersRef.current.push(t);
    });
  }, [start, end, algorithm, status]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  const pathDistance = Math.round(
    pathOrder.reduce((acc, city, i) => {
      if (i === 0) return 0;
      return acc + dist(CITIES[pathOrder[i - 1]], CITIES[city]);
    }, 0) * 4.5
  );

  const hint = !start ? 'Click a city to set the START point'
    : !end ? 'Click another city to set the END point'
    : status === 'idle' ? 'Press RUN to find the path'
    : status === 'running' ? 'Searching...'
    : `Path found — ${pathDistance} km · ${pathOrder.length} cities`;

  return (
    <div className="flex flex-col w-full h-full bg-[#000] font-mono overflow-hidden">

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-[#141414] flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-[#2e2e2e] text-[9px] tracking-[0.3em] uppercase">~/algorithms/europe</p>
          <h1 className="text-white text-sm font-semibold tracking-tight mt-0.5">Europe City Pathfinder</h1>
        </div>

        {/* Algorithm toggle */}
        <div className="flex border border-[#1a1a1a]">
          {(['astar', 'dijkstra'] as Algorithm[]).map(algo => (
            <button
              key={algo}
              onClick={() => { if (status === 'idle') setAlgorithm(algo); }}
              disabled={status !== 'idle'}
              className={cn(
                'text-[9px] tracking-[0.15em] uppercase px-3 py-2 transition-all duration-150',
                algorithm === algo
                  ? 'bg-white text-black font-semibold'
                  : 'text-[#444] hover:text-[#888] disabled:text-[#2a2a2a]'
              )}
            >
              {algo === 'astar' ? 'A*' : "Dijkstra"}
            </button>
          ))}
        </div>

        <button
          onClick={run}
          disabled={!start || !end || status !== 'idle'}
          className="flex items-center gap-1.5 bg-white text-black text-[9px] tracking-[0.15em] uppercase font-semibold px-4 py-2 hover:bg-[#ddd] transition-colors disabled:bg-[#111] disabled:text-[#333] disabled:border disabled:border-[#1a1a1a]"
        >
          <Play className="h-3 w-3" /> Run
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 border border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333] text-[9px] tracking-[0.15em] uppercase px-4 py-2 transition-all"
        >
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* ── Main Area ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map SVG */}
        <div className="flex-1 relative overflow-hidden bg-[#030303]">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-full"
            style={{ userSelect: 'none' }}
          >
            {/* Subtle dot grid */}
            <defs>
              <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.6" fill="#111" />
              </pattern>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="url(#dots)" />

            {/* ── Edges ── */}
            {EDGE_DEFS.map(([a, b]) => {
              const ca = CITIES[a]; const cb = CITIES[b];
              const key = [a, b].sort().join('|');
              const isPath = pathEdges.has(key);
              const isAdjToStart = a === start || b === start || a === end || b === end;
              return (
                <line
                  key={key}
                  x1={ca.x} y1={ca.y}
                  x2={cb.x} y2={cb.y}
                  stroke={isPath ? '#fff' : isAdjToStart && status === 'idle' ? '#222' : '#141414'}
                  strokeWidth={isPath ? 1.5 : 1}
                  strokeOpacity={isPath ? 1 : 0.8}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* ── Cities ── */}
            {(Object.values(CITIES) as CityNode[]).map(city => {
              const isStart = city.id === start;
              const isEnd   = city.id === end;
              const isPath  = pathSet.has(city.id as CityId);
              const isVisited = visitedSet.has(city.id as CityId);
              const isHighlighted = isStart || isEnd || isPath;
              const labelLeft = city.x > SVG_W - 80;
              const labelAbove = city.y > SVG_H - 50;

              return (
                <g
                  key={city.id}
                  onClick={() => handleCityClick(city.id as CityId)}
                  style={{ cursor: status === 'running' ? 'default' : 'pointer' }}
                  className="group"
                >
                  {/* Hit area */}
                  <circle cx={city.x} cy={city.y} r={14} fill="transparent" />

                  {/* Outer ring — end city */}
                  {isEnd && (
                    <circle cx={city.x} cy={city.y} r={8}
                      fill="none" stroke="#888" strokeWidth={1}
                      className="animate-pulse"
                    />
                  )}

                  {/* Node dot */}
                  <circle
                    cx={city.x} cy={city.y}
                    r={isHighlighted ? 4.5 : isVisited ? 3 : 2.5}
                    fill={
                      isStart ? '#fff'
                      : isEnd ? '#666'
                      : isPath ? '#fff'
                      : isVisited ? '#2e2e2e'
                      : '#1a1a1a'
                    }
                    stroke={
                      isStart ? '#fff'
                      : isEnd ? '#888'
                      : isPath ? '#fff'
                      : isVisited ? '#333'
                      : '#252525'
                    }
                    strokeWidth={isHighlighted ? 1.5 : 1}
                    className="transition-all duration-200"
                  />

                  {/* City label */}
                  <text
                    x={city.x + (labelLeft ? -8 : 8)}
                    y={city.y + (labelAbove ? -8 : 4)}
                    textAnchor={labelLeft ? 'end' : 'start'}
                    fill={isHighlighted ? '#fff' : isVisited ? '#3a3a3a' : '#222'}
                    fontSize="8"
                    fontFamily="monospace"
                    letterSpacing="0.8"
                    className="transition-all duration-200 pointer-events-none"
                  >
                    {city.name.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Status hint overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="border border-[#1a1a1a] bg-[#000]/80 backdrop-blur-sm px-4 py-2">
              <p className={cn(
                'text-[10px] tracking-[0.2em] uppercase transition-colors',
                status === 'done' ? 'text-white' : 'text-[#444]'
              )}>{hint}</p>
            </div>
          </div>
        </div>

        {/* ── Right Panel ──────────────────────────────────────── */}
        <div className="w-52 flex-shrink-0 border-l border-[#141414] flex flex-col bg-[#020202]">

          {/* Route info */}
          <div className="p-4 border-b border-[#0e0e0e] space-y-4">
            <div>
              <p className="text-[#2e2e2e] text-[9px] tracking-[0.2em] uppercase mb-2">Route</p>
              <div className="space-y-2">
                {['start', 'end'].map(type => {
                  const id = type === 'start' ? start : end;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        id ? (type === 'start' ? 'bg-white' : 'bg-[#666]') : 'border border-[#222]'
                      )} />
                      <span className={cn(
                        'text-xs tracking-wide',
                        id ? 'text-white' : 'text-[#2a2a2a]'
                      )}>
                        {id ? CITIES[id].name : type === 'start' ? 'Start city' : 'End city'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {[
                { label: 'Algorithm', value: algorithm === 'astar' ? 'A* Search' : "Dijkstra's" },
                { label: 'Explored', value: visitedCount > 0 ? `${visitedCount} cities` : '—' },
                { label: 'Path', value: pathOrder.length > 0 ? `${pathOrder.length} cities` : '—' },
                { label: 'Distance', value: pathDistance > 0 ? `~${pathDistance} km` : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[#252525] text-[9px] tracking-[0.2em] uppercase mb-0.5">{label}</p>
                  <p className="text-[#888] text-xs tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Path sequence */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-[#2e2e2e] text-[9px] tracking-[0.2em] uppercase mb-3">Path Sequence</p>
            {pathOrder.length === 0 ? (
              <p className="text-[#1e1e1e] text-[10px] tracking-widest uppercase">No path yet</p>
            ) : (
              <div className="space-y-1.5">
                {pathOrder.map((city, i) => (
                  <div key={city} className="flex items-center gap-2">
                    {i < pathOrder.length - 1
                      ? <ChevronRight className="w-2.5 h-2.5 text-[#2a2a2a] flex-shrink-0" />
                      : <div className="w-2.5 h-2.5 rounded-full bg-[#555] flex-shrink-0" />
                    }
                    <span className={cn(
                      'text-[10px] tracking-wide',
                      i === 0 || i === pathOrder.length - 1 ? 'text-white' : 'text-[#666]'
                    )}>
                      {CITIES[city].name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-[#0e0e0e] space-y-2">
            <p className="text-[#2e2e2e] text-[9px] tracking-[0.2em] uppercase mb-2">Legend</p>
            {[
              { dot: 'bg-white', label: 'Start / Path' },
              { dot: 'bg-[#666]', label: 'End city' },
              { dot: 'bg-[#2e2e2e] border border-[#333]', label: 'Explored' },
              { dot: 'border border-[#222]', label: 'Unvisited' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dot)} />
                <span className="text-[#333] text-[9px] tracking-[0.1em] uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
