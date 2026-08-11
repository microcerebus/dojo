/**
 * The complete VisuAlgo (https://visualgo.net) visualizer catalog, enumerated
 * from the site's landing page and verified with a live HTTP check (see
 * `src/data/visualgo.test.ts`). Links only - VisuAlgo's visualizations are
 * copyrighted educational material, not licensed for copying, scraping or
 * embedding, so dojo never reproduces them, only points at them.
 *
 * `moduleIds` is empty for topics outside the CTCI curriculum - kept in the
 * catalog anyway so the resources view can show the full "everything from
 * VisuAlgo" list with an honest "no matching module" instead of a silently
 * partial one.
 */
export interface VisualgoEntry {
  id: string;
  title: string;
  category: string;
  url: string;
  moduleIds: string[];
}

const VISUALGO_BASE = 'https://visualgo.net/en';

export const VISUALGO_CATALOG: VisualgoEntry[] = [
  { id: 'array', title: 'Array', category: 'Data structures', url: `${VISUALGO_BASE}/array`, moduleIds: ['arrays-strings'] },
  { id: 'list', title: 'Linked List', category: 'Data structures', url: `${VISUALGO_BASE}/list`, moduleIds: ['linked-lists'] },
  { id: 'heap', title: 'Binary Heap', category: 'Data structures', url: `${VISUALGO_BASE}/heap`, moduleIds: ['heaps-tries'] },
  {
    id: 'hashtable',
    title: 'Hash Table',
    category: 'Data structures',
    url: `${VISUALGO_BASE}/hashtable`,
    moduleIds: ['arrays-strings', 'advanced-topics'],
  },
  {
    id: 'bst',
    title: 'Binary Search Tree, AVL Tree',
    category: 'Data structures',
    url: `${VISUALGO_BASE}/bst`,
    moduleIds: ['trees-graphs', 'advanced-topics'],
  },
  { id: 'graphds', title: 'Graph Structures', category: 'Data structures', url: `${VISUALGO_BASE}/graphds`, moduleIds: ['trees-graphs'] },
  { id: 'ufds', title: 'Union-Find Disjoint Sets', category: 'Data structures', url: `${VISUALGO_BASE}/ufds`, moduleIds: ['trees-graphs', 'hard'] },
  { id: 'fenwicktree', title: 'Fenwick Tree', category: 'Data structures', url: `${VISUALGO_BASE}/fenwicktree`, moduleIds: [] },
  { id: 'segmenttree', title: 'Segment Tree', category: 'Data structures', url: `${VISUALGO_BASE}/segmenttree`, moduleIds: [] },

  { id: 'sorting', title: 'Sorting', category: 'Sorting & searching', url: `${VISUALGO_BASE}/sorting`, moduleIds: ['sorting-searching'] },

  { id: 'bitmask', title: 'Bitmask', category: 'Recursion & bit tricks', url: `${VISUALGO_BASE}/bitmask`, moduleIds: ['bit-manipulation', 'recursion-dp'] },
  { id: 'recursion', title: 'Recursion Tree / DAG', category: 'Recursion & bit tricks', url: `${VISUALGO_BASE}/recursion`, moduleIds: ['recursion-dp'] },

  { id: 'dfsbfs', title: 'Graph Traversal (DFS/BFS)', category: 'Graph algorithms', url: `${VISUALGO_BASE}/dfsbfs`, moduleIds: ['trees-graphs'] },
  { id: 'mst', title: 'Minimum Spanning Tree', category: 'Graph algorithms', url: `${VISUALGO_BASE}/mst`, moduleIds: ['advanced-topics'] },
  { id: 'sssp', title: 'Single-Source Shortest Paths', category: 'Graph algorithms', url: `${VISUALGO_BASE}/sssp`, moduleIds: ['advanced-topics'] },
  {
    id: 'cyclefinding',
    title: 'Cycle Finding',
    category: 'Graph algorithms',
    url: `${VISUALGO_BASE}/cyclefinding`,
    moduleIds: ['trees-graphs', 'advanced-topics'],
  },
  { id: 'maxflow', title: 'Max Flow / Network Flow', category: 'Graph algorithms', url: `${VISUALGO_BASE}/maxflow`, moduleIds: [] },
  { id: 'matching', title: 'Graph Matching', category: 'Graph algorithms', url: `${VISUALGO_BASE}/matching`, moduleIds: [] },
  { id: 'mvc', title: 'Minimum Vertex Cover', category: 'Graph algorithms', url: `${VISUALGO_BASE}/mvc`, moduleIds: [] },
  { id: 'steinertree', title: 'Steiner Tree', category: 'Graph algorithms', url: `${VISUALGO_BASE}/steinertree`, moduleIds: [] },
  { id: 'tsp', title: 'Traveling Salesperson Problem', category: 'Graph algorithms', url: `${VISUALGO_BASE}/tsp`, moduleIds: [] },

  { id: 'suffixtree', title: 'Suffix Tree', category: 'String structures', url: `${VISUALGO_BASE}/suffixtree`, moduleIds: [] },
  { id: 'suffixarray', title: 'Suffix Array', category: 'String structures', url: `${VISUALGO_BASE}/suffixarray`, moduleIds: [] },

  { id: 'polygon', title: 'Polygon (Geometry)', category: 'Geometry', url: `${VISUALGO_BASE}/polygon`, moduleIds: [] },
  { id: 'convexhull', title: 'Convex Hull', category: 'Geometry', url: `${VISUALGO_BASE}/convexhull`, moduleIds: [] },

  { id: 'reductions', title: 'NP-Complete Reductions', category: 'Theory', url: `${VISUALGO_BASE}/reductions`, moduleIds: ['advanced-topics'] },
];

const byId = new Map(VISUALGO_CATALOG.map((entry) => [entry.id, entry]));
const byUrl = new Map(VISUALGO_CATALOG.map((entry) => [entry.url, entry]));

/** The URL for a catalog entry, by id - throws on a typo rather than shipping a dead link. */
export function visualgoUrl(id: string): string {
  const entry = byId.get(id);
  if (!entry) throw new Error(`Unknown VisuAlgo catalog id: ${id}`);
  return entry.url;
}

/** The catalog entry a module's `VisualizerLink.url` points at, for displaying its title. */
export function visualgoEntryForUrl(url: string): VisualgoEntry | undefined {
  return byUrl.get(url);
}
