import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * SPA navigation does not reset document scroll. After route changes, scroll to top
 * so pages like `/contact` open at the header (not mid-page / FAQ).
 */
export function ScrollToTopOnNavigate() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}
