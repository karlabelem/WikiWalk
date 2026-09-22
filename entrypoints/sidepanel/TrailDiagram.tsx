import type { WalkNode } from '@/lib/types';

const ROW_HEIGHT = 52;
const LANE_GAP = 22;
const GUTTER_PADDING = 10;

interface LaidOutNode extends WalkNode {
  lane: number;
  /** Lane this node forks off of, if it doesn't simply continue the previous row's lane. */
  forkFromLane: number | null;
}

/**
 * Rows follow visit order (chronological), so a fork appears at the row where
 * it was actually clicked, not reshuffled next to its parent. A node starts a
 * new lane only when its parent isn't the immediately preceding node — i.e.
 * the user went back and branched off somewhere earlier.
 */
function layoutTrail(nodes: WalkNode[]): LaidOutNode[] {
  const laneByNodeId = new Map<string, number>();
  let maxLane = 0;
  return nodes.map((node, row) => {
    let lane = 0;
    let forkFromLane: number | null = null;
    if (node.parentId !== null) {
      const parentLane = laneByNodeId.get(node.parentId) ?? 0;
      const prevNode = nodes[row - 1];
      if (prevNode?.id === node.parentId) {
        lane = parentLane;
      } else {
        maxLane += 1;
        lane = maxLane;
        forkFromLane = parentLane;
      }
    }
    laneByNodeId.set(node.id, lane);
    return { ...node, lane, forkFromLane };
  });
}

const laneX = (lane: number) => GUTTER_PADDING + lane * LANE_GAP;
const rowY = (row: number) => row * ROW_HEIGHT + ROW_HEIGHT / 2;

export function TrailDiagram({
  nodes,
  retraceIndex,
  onToggleLandmark,
}: {
  nodes: WalkNode[];
  retraceIndex: number | null;
  onToggleLandmark: (nodeId: string) => void;
}) {
  const laidOut = layoutTrail(nodes);
  const rowById = new Map(nodes.map((node, row) => [node.id, row]));
  const maxLane = laidOut.reduce((max, node) => Math.max(max, node.lane), 0);
  const gutterWidth = laneX(maxLane) + GUTTER_PADDING;
  const diagramHeight = nodes.length * ROW_HEIGHT;

  return (
    <div className="relative" style={{ height: diagramHeight }}>
      <svg width={gutterWidth} height={diagramHeight} className="absolute left-0 top-0">
        {laidOut.map((node, i) => {
          if (i === 0) return null;
          const isActive = retraceIndex !== null && retraceIndex >= i;
          const strokeClassName = isActive ? 'stroke-indigo-400' : 'stroke-stone-300';

          if (node.forkFromLane !== null) {
            const parentRow = rowById.get(node.parentId!)!;
            const x1 = laneX(node.forkFromLane);
            const y1 = rowY(parentRow);
            const x2 = laneX(node.lane);
            const y2 = rowY(i);
            const midY = (y1 + y2) / 2;
            return (
              <path
                key={node.id}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                strokeWidth={1.5}
                className={strokeClassName}
              />
            );
          }

          return (
            <line
              key={node.id}
              x1={laneX(node.lane)}
              y1={rowY(i - 1)}
              x2={laneX(node.lane)}
              y2={rowY(i)}
              strokeWidth={1.5}
              className={strokeClassName}
            />
          );
        })}
        {laidOut.map((node, i) => (
          <circle
            key={node.id}
            cx={laneX(node.lane)}
            cy={rowY(i)}
            r={node.isLandmark ? 5 : 3.5}
            className={
              retraceIndex === i
                ? 'fill-indigo-600'
                : node.isLandmark
                  ? 'fill-indigo-400'
                  : 'fill-stone-400'
            }
          />
        ))}
      </svg>

      <ol style={{ paddingLeft: gutterWidth + 10 }}>
        {laidOut.map((node, i) => (
          <li
            key={node.id}
            style={{ height: ROW_HEIGHT }}
            className={`flex items-center gap-2 rounded-md pr-2 text-sm transition-colors ${
              retraceIndex === i ? 'bg-indigo-50' : ''
            }`}
          >
            <a
              href={node.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 truncate hover:underline"
            >
              {node.title}
            </a>
            <button
              onClick={() => onToggleLandmark(node.id)}
              aria-label="Toggle landmark"
              className={node.isLandmark ? 'text-indigo-500' : 'text-stone-300'}
            >
              ★
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
