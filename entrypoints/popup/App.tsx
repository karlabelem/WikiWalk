import { useEffect, useState } from 'react';
import { onActiveSessionChange } from '@/lib/storage';
import { sendWikiWalkMessage } from '@/lib/messaging';
import { distanceWalked, landmarks, type WalkSession } from '@/lib/types';

function App() {
  const [session, setSession] = useState<WalkSession | null>(null);

  useEffect(() => {
    sendWikiWalkMessage({ type: 'GET_SESSION' }).then(setSession);
    return onActiveSessionChange(setSession);
  }, []);

  const openTrail = () => browser.sidePanel.open({ windowId: browser.windows.WINDOW_ID_CURRENT });

  const resetWalk = async () => {
    setSession(await sendWikiWalkMessage({ type: 'RESET_SESSION' }));
  };

  return (
    <div className="w-72 space-y-4 bg-stone-50 p-4 text-stone-800">
      <div>
        <h1 className="text-lg font-semibold">🚶 Wiki Walk</h1>
        <p className="text-sm text-stone-500">Your current session</p>
      </div>

      <div className="flex gap-4">
        <Stat label="Distance walked" value={session ? distanceWalked(session) : '—'} />
        <Stat label="Landmarks" value={session ? landmarks(session).length : '—'} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={openTrail}
          className="flex-1 rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Open trail
        </button>
        <button
          onClick={resetWalk}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1 rounded-md bg-white p-3 shadow-sm">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}

export default App;
