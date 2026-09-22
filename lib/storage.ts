import { browser, type Browser } from 'wxt/browser';
import { createEmptySession, type WalkSession } from '@/lib/types';

const ACTIVE_SESSION_KEY = 'wikiwalk:activeSession';

export async function getActiveSession(): Promise<WalkSession> {
  const stored = await browser.storage.local.get(ACTIVE_SESSION_KEY);
  const session = stored[ACTIVE_SESSION_KEY] as WalkSession | undefined;
  return session ?? createEmptySession();
}

export async function saveActiveSession(session: WalkSession): Promise<void> {
  await browser.storage.local.set({ [ACTIVE_SESSION_KEY]: session });
}

export async function resetActiveSession(): Promise<WalkSession> {
  const session = createEmptySession();
  await saveActiveSession(session);
  return session;
}

/** Fires whenever the active session changes, from any extension context. */
export function onActiveSessionChange(
  callback: (session: WalkSession) => void,
) {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName !== 'local') return;
    const change = changes[ACTIVE_SESSION_KEY];
    if (change?.newValue) callback(change.newValue as WalkSession);
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
