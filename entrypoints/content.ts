import { sendWikiWalkMessage } from '@/lib/messaging';

function getCanonicalUrl(): string {
  const canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  return canonical?.href ?? `${location.origin}${location.pathname}`;
}

function getArticleTitle(): string {
  const heading = document.querySelector('#firstHeading');
  return heading?.textContent?.trim() ?? document.title.replace(/ - Wikipedia$/, '');
}

export default defineContentScript({
  matches: ['*://*.wikipedia.org/wiki/*'],
  main() {
    sendWikiWalkMessage({
      type: 'VISIT_PAGE',
      url: getCanonicalUrl(),
      title: getArticleTitle(),
    });
  },
});
