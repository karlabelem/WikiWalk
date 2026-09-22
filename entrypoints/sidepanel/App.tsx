import { useEffect, useRef, useState } from 'react';
import { onActiveSessionChange } from '@/lib/storage';
import { sendWikiWalkMessage } from '@/lib/messaging';
import { distanceWalked, landmarks, type WalkSession } from '@/lib/types';
import { TrailDiagram } from './TrailDiagram';

const RETRACE_STEP_MS = 900;

function App() {
  const [session, setSession] = useState<WalkSession | null>(null);
  const [retraceIndex, setRetraceIndex] = useState<number | null>(null);
  const retraceTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    sendWikiWalkMessage({ type: 'GET_SESSION' }).then(setSession);
    return onActiveSessionChange(setSession);
  }, []);

  useEffect(() => () => clearInterval(retraceTimer.current), []);

  const toggleLandmark = async (nodeId: string) => {
    setSession(await sendWikiWalkMessage({ type: 'TOGGLE_LANDMARK', nodeId }));
  };

  const retraceSteps = () => {
    if (!session || session.nodes.length === 0) return;
    clearInterval(retraceTimer.current);
    let i = 0;
    setRetraceIndex(0);
    retraceTimer.current = setInterval(() => {
      i += 1;
      if (i >= session.nodes.length) {
        clearInterval(retraceTimer.current);
        setRetraceIndex(null);
        return;
      }
      setRetraceIndex(i);
    }, RETRACE_STEP_MS);
  };

  const exportWalk = () => {
    if (!session) return;
    const lines = [
      `# Wiki Walk — ${new Date(session.startedAt).toLocaleDateString()}`,
      '',
      ...session.nodes.map((node, i) => {
        const star = node.isLandmark ? ' ⭐' : '';
        return `${i + 1}. [${node.title}](${node.url})${star}`;
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wiki-walk-${session.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen space-y-4 bg-stone-50 p-4 text-stone-800">
      <header>
        <h1 className="text-lg font-semibold">🚶 Your walk</h1>
        <p className="text-sm text-stone-500">
          {distanceWalked(session)} steps · {landmarks(session).length} landmarks
        </p>
      </header>

      <div className="flex gap-2">
        <button
          onClick={retraceSteps}
          disabled={session.nodes.length === 0}
          className="flex-1 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-40"
        >
          Retrace steps
        </button>
        <button
          onClick={exportWalk}
          disabled={session.nodes.length === 0}
          className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-40"
        >
          Export walk
        </button>
      </div>

      {session.nodes.length === 0 ? (
        <p className="text-sm text-stone-400">
          Visit a Wikipedia article to start your walk.
        </p>
      ) : (
        <TrailDiagram
          nodes={session.nodes}
          retraceIndex={retraceIndex}
          onToggleLandmark={toggleLandmark}
        />
      )}
    </div>
  );
}

export default App;
