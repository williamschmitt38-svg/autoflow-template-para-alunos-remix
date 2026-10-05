import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} • AutoFlow AI`;
    return () => { document.title = prev; };
  }, [title]);
}

export default useDocumentTitle;

