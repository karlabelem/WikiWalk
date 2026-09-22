import type { WalkNode } from '@/lib/types';

const ROW_HEIGHT = 52;
const LANE_GAP = 22;
const GUTTER_PADDING = 14;
const STEP_SPACING = 11;
const STEP_SIDE_OFFSET = 2.4;
/** Keeps footsteps clear of the node dots at both ends of a connector. */
const FOOT_MARGIN = 9;

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

/** A shoe-sole silhouette (ball + heel, no toes) — reads as a shoe print at small sizes. */
function Footstep({ x, y, angle, mirror }: { x: number; y: number; angle: number; mirror: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${mirror ? -1 : 1}, 1)`}>
      <ellipse cx="0" cy="2.6" rx="2.5" ry="3" />
      <ellipse cx="0" cy="-3" rx="2" ry="2.4" />
    </g>
  );
}

/** A trail of alternating left/right footsteps from (x1,y1) to (x2,y2), replacing a plain connector line. */
function FootstepTrail({
  x1,
  y1,
  x2,
  y2,
  className,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  className: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length < 1) return null;

  const usableLength = length - FOOT_MARGIN * 2;
  if (usableLength <= 0) return null;

  const angleDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const startT = FOOT_MARGIN / length;
  const endT = 1 - FOOT_MARGIN / length;
  const steps = Math.max(1, Math.round(usableLength / STEP_SPACING));

  return (
    <g className={className}>
      {Array.from({ length: steps }, (_, i) => {
        const t = startT + ((i + 0.5) / steps) * (endT - startT);
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <Footstep
            key={i}
            x={cx + px * STEP_SIDE_OFFSET * side}
            y={cy + py * STEP_SIDE_OFFSET * side}
            angle={angleDeg}
            mirror={side < 0}
          />
        );
      })}
    </g>
  );
}

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
      <svg
        width={gutterWidth}
        height={diagramHeight}
        className="absolute left-0 top-0 fill-stone-300"
      >
        {laidOut.map((node, i) => {
          if (i === 0) return null;
          const isActiveSegment = retraceIndex !== null && retraceIndex >= i;
          const segmentClassName = isActiveSegment ? 'fill-indigo-400' : 'fill-stone-300';
          if (node.forkFromLane !== null) {
            const parentRow = rowById.get(node.parentId!)!;
            return (
              <FootstepTrail
                key={node.id}
                x1={laneX(node.forkFromLane)}
                y1={rowY(parentRow)}
                x2={laneX(node.lane)}
                y2={rowY(i)}
                className={segmentClassName}
              />
            );
          }
          return (
            <FootstepTrail
              key={node.id}
              x1={laneX(node.lane)}
              y1={rowY(i - 1)}
              x2={laneX(node.lane)}
              y2={rowY(i)}
              className={segmentClassName}
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
