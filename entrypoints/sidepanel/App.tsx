import { useEffect, useRef, useState } from 'react';
import { onActiveSessionChange } from '@/lib/storage';
import { sendWikiWalkMessage } from '@/lib/messaging';
import { distanceWalked, landmarks, type WalkSession } from '@/lib/types';

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
          className="flex-1 rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-40"
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

      {/* TODO: replace this list with the footprints trail visualization */}
      <ol className="space-y-2">
        {session.nodes.map((node, i) => (
          <li
            key={node.id}
            className={`flex items-center gap-2 rounded-md border p-2 text-sm transition-colors ${
              retraceIndex === i
                ? 'border-green-600 bg-green-50'
                : 'border-stone-200 bg-white'
            }`}
          >
            <span className="w-5 shrink-0 text-stone-400">{i + 1}</span>
            <a
              href={node.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 truncate hover:underline"
            >
              {node.title}
            </a>
            <button
              onClick={() => toggleLandmark(node.id)}
              aria-label="Toggle landmark"
              className={node.isLandmark ? 'text-yellow-500' : 'text-stone-300'}
            >
              ★
            </button>
          </li>
        ))}
        {session.nodes.length === 0 && (
          <p className="text-sm text-stone-400">
            Visit a Wikipedia article to start your walk.
          </p>
        )}
      </ol>
    </div>
  );
}

export default App;
