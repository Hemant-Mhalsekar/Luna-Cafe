import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { applySeo } from '../lib/seo';

/** Keeps the page title, description and share tags in step with the current page. */
export function RouteSeo() {
  const { pathname } = useLocation();
  useEffect(() => applySeo(pathname), [pathname]);
  return null;
}
