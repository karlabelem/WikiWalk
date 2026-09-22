import { browser } from 'wxt/browser';
import type { WalkSession } from '@/lib/types';

export type WikiWalkRequest =
  | { type: 'VISIT_PAGE'; url: string; title: string }
  | { type: 'GET_SESSION' }
  | { type: 'TOGGLE_LANDMARK'; nodeId: string }
  | { type: 'RESET_SESSION' };

/** Every request resolves to the resulting session, so every UI surface
 * can just re-render off the response without a second round trip. */
export type WikiWalkResponse = WalkSession;

export function sendWikiWalkMessage(
  request: WikiWalkRequest,
): Promise<WikiWalkResponse> {
  return browser.runtime.sendMessage(request);
}
