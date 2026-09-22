/**
 * A single Wikipedia article visited during a walk.
 * `parentId` links back to the node that was open right before this one,
 * so a session can branch (e.g. after using the browser's back button)
 * instead of being forced into one straight line.
 */
export interface WalkNode {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
  parentId: string | null;
  isLandmark: boolean;
}

export interface WalkSession {
  id: string;
  startedAt: number;
  updatedAt: number;
  nodes: WalkNode[];
  /**
   * Each browser tab reads its own thread through the walk — a tab is
   * "at" the node it last visited. Keyed by tab id rather than a single
   * global pointer, so two Wikipedia tabs open at once don't interleave
   * their navigation into one shared, scrambled cursor.
   */
  cursorByTabId: Record<number, string | null>;
}

export function createEmptySession(): WalkSession {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    startedAt: now,
    updatedAt: now,
    nodes: [],
    cursorByTabId: {},
  };
}

/** Number of links traversed to build the walk (edges, not articles). */
export function distanceWalked(session: WalkSession): number {
  return Math.max(0, session.nodes.length - 1);
}

export function landmarks(session: WalkSession): WalkNode[] {
  return session.nodes.filter((node) => node.isLandmark);
}
