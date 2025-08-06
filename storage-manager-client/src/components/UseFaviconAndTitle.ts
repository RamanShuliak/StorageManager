import { useEffect } from 'react';

export function useFaviconAndTitle(title: string, iconHref: string) {
  useEffect(() => {
    document.title = title;

    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.append(link);
    }
    link.href = iconHref;
  }, [title, iconHref]);
}
