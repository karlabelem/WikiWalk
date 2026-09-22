import type { WikiWalkRequest } from '@/lib/messaging';
import { getActiveSession, resetActiveSession, saveActiveSession } from '@/lib/storage';
import type { WalkNode, WalkSession } from '@/lib/types';

async function visitPage(url: string, title: string): Promise<WalkSession> {
  const session = await getActiveSession();

  // Wikipedia fires history-state updates for the same article (e.g. jumping
  // between sections); don't log a new footprint unless the article changed.
  const currentNode = session.nodes.find((n) => n.id === session.currentNodeId);
  if (currentNode?.url === url) return session;

  const node: WalkNode = {
    id: crypto.randomUUID(),
    url,
    title,
    visitedAt: Date.now(),
    parentId: session.currentNodeId,
    isLandmark: false,
  };

  session.nodes.push(node);
  session.currentNodeId = node.id;
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
  browser.runtime.onMessage.addListener((message: WikiWalkRequest) => {
    switch (message.type) {
      case 'VISIT_PAGE':
        return visitPage(message.url, message.title);
      case 'GET_SESSION':
        return getActiveSession();
      case 'TOGGLE_LANDMARK':
        return toggleLandmark(message.nodeId);
      case 'RESET_SESSION':
        return resetActiveSession();
    }
  });
});
