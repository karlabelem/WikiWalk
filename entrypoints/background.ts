import type { WikiWalkRequest } from '@/lib/messaging';
import { getActiveSession, resetActiveSession, saveActiveSession } from '@/lib/storage';
import type { WalkNode, WalkSession } from '@/lib/types';

async function visitPage(url: string, title: string, tabId: number): Promise<WalkSession> {
  const session = await getActiveSession();
  const cursorId = session.cursorByTabId[tabId] ?? null;

  // Wikipedia fires history-state updates for the same article (e.g. jumping
  // between sections); don't log a new footprint unless the article changed.
  const currentNode = session.nodes.find((n) => n.id === cursorId);
  if (currentNode?.url === url) return session;

  // Revisiting an article already in this walk (e.g. hitting the browser's
  // back button) resumes from that existing node instead of duplicating it,
  // so the next new link forks off the real waypoint rather than a copy.
  const existingNode = session.nodes.find((n) => n.url === url);
  if (existingNode) {
    session.cursorByTabId[tabId] = existingNode.id;
    session.updatedAt = Date.now();
    await saveActiveSession(session);
    return session;
  }

  const node: WalkNode = {
    id: crypto.randomUUID(),
    url,
    title,
    visitedAt: Date.now(),
    parentId: cursorId,
    isLandmark: false,
  };

  session.nodes.push(node);
  session.cursorByTabId[tabId] = node.id;
  session.updatedAt = node.visitedAt;

  await saveActiveSession(session);
  return session;
}

async function toggleLandmark(nodeId: string): Promise<WalkSession> {
  const session = await getActiveSession();
  const node = session.nodes.find((n) => n.id === nodeId);
  if (node) {
    node.isLandmark = !node.isLandmark;
    session.updatedAt = Date.now();
    await saveActiveSession(session);
  }
  return session;
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: WikiWalkRequest, sender) => {
    switch (message.type) {
      case 'VISIT_PAGE':
        if (sender.tab?.id === undefined) return;
        return visitPage(message.url, message.title, sender.tab.id);
      case 'GET_SESSION':
        return getActiveSession();
      case 'TOGGLE_LANDMARK':
        return toggleLandmark(message.nodeId);
      case 'RESET_SESSION':
        return resetActiveSession();
    }
  });
});
