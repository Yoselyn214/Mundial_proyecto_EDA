import type { BracketNode } from "../types";

export interface HldTreeNode {
  id: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  winner: string | null;
  stageName: string;
  level: number;
  left: HldTreeNode | null;
  right: HldTreeNode | null;
  parent: HldTreeNode | null;
}

export interface HldResult {
  totalGoals: number;
  maxGoalDiff: number;
  matchesCount: number;
  path: HldTreeNode[];
  version: number;
}

class SegNode {
  left: SegNode | null = null;
  right: SegNode | null = null;
  val = 0;
  mx = 0;
}

function buildSegTree(arrVal: number[], arrMx: number[], l: number, r: number): SegNode {
  const node = new SegNode();
  if (l === r) {
    node.val = arrVal[l];
    node.mx = arrMx[l];
    return node;
  }

  const mid = Math.floor((l + r) / 2);
  node.left = buildSegTree(arrVal, arrMx, l, mid);
  node.right = buildSegTree(arrVal, arrMx, mid + 1, r);
  node.val = (node.left?.val ?? 0) + (node.right?.val ?? 0);
  node.mx = Math.max(node.left?.mx ?? 0, node.right?.mx ?? 0);
  return node;
}

function updateSegTree(
  prev: SegNode | null,
  l: number,
  r: number,
  pos: number,
  newVal: number,
  newMx: number,
): SegNode {
  const node = new SegNode();
  if (l === r) {
    node.val = newVal;
    node.mx = newMx;
    return node;
  }

  const mid = Math.floor((l + r) / 2);
  if (pos <= mid) {
    node.left = updateSegTree(prev?.left ?? null, l, mid, pos, newVal, newMx);
    node.right = prev?.right ?? null;
  } else {
    node.left = prev?.left ?? null;
    node.right = updateSegTree(prev?.right ?? null, mid + 1, r, pos, newVal, newMx);
  }

  node.val = (node.left?.val ?? 0) + (node.right?.val ?? 0);
  node.mx = Math.max(node.left?.mx ?? 0, node.right?.mx ?? 0);
  return node;
}

function querySegTree(node: SegNode | null, l: number, r: number, ql: number, qr: number): [number, number] {
  if (!node || qr < l || r < ql) {
    return [0, 0];
  }

  if (ql <= l && r <= qr) {
    return [node.val, node.mx];
  }

  const mid = Math.floor((l + r) / 2);
  const [lv, lm] = querySegTree(node.left, l, mid, ql, qr);
  const [rv, rm] = querySegTree(node.right, mid + 1, r, ql, qr);
  return [lv + rv, Math.max(lm, rm)];
}

function stageToLevel(stageName: string): number {
  const normalized = stageName.toLowerCase();
  if (normalized.includes("final")) return 0;
  if (normalized.includes("semifinal")) return 1;
  if (normalized.includes("cuarto")) return 2;
  return 3;
}

export class HLDModel {
  private readonly nodes: HldTreeNode[];
  private readonly idMap = new Map<string, HldTreeNode>();
  private readonly subtreeSize = new Map<string, number>();
  private readonly heavyChild = new Map<string, string | null>();
  private readonly depth = new Map<string, number>();
  private readonly head = new Map<string, string>();
  private readonly pos = new Map<string, number>();
  private readonly posToNode: string[] = [];
  private readonly segRoots: Array<SegNode | null> = [];
  private readonly versions: Array<Record<string, { homeScore: number; awayScore: number; winner: string | null }>> = [];
  private readonly segSize: number;
  private currentVersion = 0;
  private readonly root: HldTreeNode | null;

  constructor(root: HldTreeNode | null, nodes: HldTreeNode[]) {
    this.root = root;
    this.nodes = nodes;
    this.segSize = nodes.length;

    for (const node of nodes) {
      this.idMap.set(node.id, node);
    }

    this.versions.push({});

    if (root) {
      this.preprocess();
    }
  }

  private preprocess(): void {
    this.dfsSize(this.root, 0);

    for (const node of this.nodes) {
      const children = this.children(node);
      if (!children.length) {
        this.heavyChild.set(node.id, null);
      } else {
        const heavy = children.reduce((best, current) => {
          const currentSize = this.subtreeSize.get(current.id) ?? 0;
          const bestSize = this.subtreeSize.get(best.id) ?? 0;
          return currentSize > bestSize ? current : best;
        });
        this.heavyChild.set(node.id, heavy.id);
      }
    }

    this.assignPositions(this.root, this.root?.id ?? "");

    const arrVal: number[] = [];
    const arrMx: number[] = [];
    for (const node of this.nodes) {
      const p = this.pos.get(node.id);
      if (p === undefined) continue;
      arrVal[p] = node.homeScore + node.awayScore;
      arrMx[p] = Math.abs(node.homeScore - node.awayScore);
    }

    this.segRoots.push(buildSegTree(arrVal, arrMx, 0, Math.max(0, this.segSize - 1)));
  }

  private dfsSize(node: HldTreeNode | null, depth: number): number {
    if (!node) return 0;
    this.depth.set(node.id, depth);
    const children = this.children(node);
    const size = 1 + children.reduce((acc, child) => acc + this.dfsSize(child, depth + 1), 0);
    this.subtreeSize.set(node.id, size);
    return size;
  }

  private assignPositions(node: HldTreeNode | null, headId: string): void {
    if (!node) return;

    const nid = node.id;
    this.head.set(nid, headId);
    this.pos.set(nid, this.posToNode.length);
    this.posToNode.push(nid);

    const heavy = this.heavyChild.get(nid);
    if (heavy) {
      this.assignPositions(this.idMap.get(heavy) ?? null, headId);
    }

    for (const child of this.children(node)) {
      if (child.id !== heavy) {
        this.assignPositions(child, child.id);
      }
    }
  }

  private children(node: HldTreeNode): HldTreeNode[] {
    return [node.left, node.right].filter((child): child is HldTreeNode => child !== null);
  }

  teamPath(team: string): HldTreeNode[] {
    const matches = this.nodes.filter((node) => node.home === team || node.away === team);
    return matches.sort((a, b) => b.level - a.level);
  }

  queryTeamPath(team: string, version = this.currentVersion): HldResult {
    const path = this.teamPath(team);
    const segRoot = this.segRoots[version] ?? null;
    let total = 0;
    let mx = 0;

    for (const node of path) {
      const pos = this.pos.get(node.id);
      if (pos === undefined) continue;
      const [g, d] = querySegTree(segRoot, 0, Math.max(0, this.segSize - 1), pos, pos);
      total += g;
      mx = Math.max(mx, d);
    }

    return {
      totalGoals: total,
      maxGoalDiff: mx,
      matchesCount: path.length,
      path,
      version,
    };
  }

  queryPathBetween(uId: string, vId: string, version = this.currentVersion): [number, number] {
    const segRoot = this.segRoots[version] ?? null;
    const u = this.idMap.get(uId) ?? null;
    const v = this.idMap.get(vId) ?? null;
    if (!u || !v) return [0, 0];

    let currentU = u;
    let currentV = v;
    let total = 0;
    let mx = 0;

    while (this.head.get(currentU.id) !== this.head.get(currentV.id)) {
      if ((this.depth.get(this.head.get(currentU.id) ?? "") ?? 0) < (this.depth.get(this.head.get(currentV.id) ?? "") ?? 0)) {
        [currentU, currentV] = [currentV, currentU];
      }

      const pu = this.pos.get(currentU.id);
      const ph = this.pos.get(this.head.get(currentU.id) ?? "");
      if (pu === undefined || ph === undefined) break;
      const [g, d] = querySegTree(segRoot, 0, Math.max(0, this.segSize - 1), Math.min(ph, pu), Math.max(ph, pu));
      total += g;
      mx = Math.max(mx, d);

      const headNode = this.idMap.get(this.head.get(currentU.id) ?? "") ?? null;
      if (!headNode?.parent) break;
      currentU = headNode.parent;
    }

    if (currentU && currentV) {
      const pu = this.pos.get(currentU.id);
      const pv = this.pos.get(currentV.id);
      if (pu !== undefined && pv !== undefined) {
        const [g, d] = querySegTree(segRoot, 0, Math.max(0, this.segSize - 1), Math.min(pu, pv), Math.max(pu, pv));
        total += g;
        mx = Math.max(mx, d);
      }
    }

    return [total, mx];
  }

  createScenario(nodeId: string, newHome: number, newAway: number, newWinner = ""): number {
    const node = this.idMap.get(nodeId);
    if (!node) throw new Error(`node ${nodeId} no existe`);

    const winner = newWinner || (newHome > newAway ? node.home : newAway > newHome ? node.away : node.winner);
    const newState = {
      homeScore: newHome,
      awayScore: newAway,
      winner,
    };

    const stateCopy = { ...this.versions[this.currentVersion] };
    stateCopy[nodeId] = newState;
    this.versions.push(stateCopy);

    const pos = this.pos.get(nodeId);
    if (pos === undefined) throw new Error(`pos ${nodeId} no existe`);

    const newSeg = updateSegTree(this.segRoots[this.currentVersion], 0, Math.max(0, this.segSize - 1), pos, newHome + newAway, Math.abs(newHome - newAway));
    this.segRoots.push(newSeg);
    this.currentVersion += 1;
    return this.currentVersion;
  }

  getNodeValue(nodeId: string, version = this.currentVersion): { homeScore: number; awayScore: number; winner: string | null } {
    const node = this.idMap.get(nodeId);
    if (!node) throw new Error(`node ${nodeId} no existe`);
    const state = this.versions[version];
    return state?.[nodeId] ?? { homeScore: node.homeScore, awayScore: node.awayScore, winner: node.winner };
  }

  getChains(): HldTreeNode[][] {
    const chains = new Map<string, HldTreeNode[]>();
    for (const node of this.nodes) {
      const head = this.head.get(node.id) ?? node.id;
      const chain = chains.get(head) ?? [];
      chain.push(node);
      chains.set(head, chain);
    }

    return Array.from(chains.values()).map((chain) => chain.sort((a, b) => (this.pos.get(a.id) ?? 0) - (this.pos.get(b.id) ?? 0)));
  }

  getCurrentVersion(): number {
    return this.currentVersion;
  }
}

export function buildHldModelFromBracket(bracket: Record<string, BracketNode>): HLDModel {
  const entries = Object.values(bracket);
  const nodes = entries.map((entry) => ({
    id: entry.id,
    home: entry.teamA ?? "",
    away: entry.teamB ?? "",
    homeScore: entry.scoreA ?? 0,
    awayScore: entry.scoreB ?? 0,
    winner: entry.winner,
    stageName: entry.stageName,
    level: stageToLevel(entry.stageName),
    left: null,
    right: null,
    parent: null,
  }));

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  for (const entry of entries) {
    const node = nodeMap.get(entry.id);
    if (!node) continue;
    const leftChild = entry.leftChildId ? nodeMap.get(entry.leftChildId) ?? null : null;
    const rightChild = entry.rightChildId ? nodeMap.get(entry.rightChildId) ?? null : null;
    node.left = leftChild;
    node.right = rightChild;
    if (leftChild) leftChild.parent = node;
    if (rightChild) rightChild.parent = node;
  }

  const root = nodes.find((node) => node.parent === null) ?? nodes[0] ?? null;
  return new HLDModel(root, nodes);
}
