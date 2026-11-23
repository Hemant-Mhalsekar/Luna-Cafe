import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

// Home is part of the first download; every other page loads its code when first visited.
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'games', lazy: () => import('./pages/Games').then((m) => ({ Component: m.Games })) },
      { path: 'menu', lazy: () => import('./pages/Menu').then((m) => ({ Component: m.Menu })) },
      { path: 'book', lazy: () => import('./pages/Book').then((m) => ({ Component: m.Book })) },
      { path: 'events', lazy: () => import('./pages/Events').then((m) => ({ Component: m.Events })) },
      { path: 'about', lazy: () => import('./pages/About').then((m) => ({ Component: m.About })) },
      { path: 'contact', lazy: () => import('./pages/Contact').then((m) => ({ Component: m.Contact })) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
