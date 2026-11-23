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
  // Staff area: not linked from the site, kept out of the public bundle.
  { path: 'admin/login', lazy: () => import('./admin/Login').then((m) => ({ Component: m.Login })) },
  {
    path: 'admin',
    lazy: () => import('./admin/AdminLayout').then((m) => ({ Component: m.AdminLayout })),
    children: [
      { index: true, lazy: () => import('./admin/Dashboard').then((m) => ({ Component: m.Dashboard })) },
      { path: 'reservations', lazy: () => import('./admin/Reservations').then((m) => ({ Component: m.Reservations })) },
      { path: 'games', lazy: () => import('./admin/GamesAdmin').then((m) => ({ Component: m.GamesAdmin })) },
      { path: 'menu', lazy: () => import('./admin/MenuAdmin').then((m) => ({ Component: m.MenuAdmin })) },
      { path: 'events', lazy: () => import('./admin/EventsAdmin').then((m) => ({ Component: m.EventsAdmin })) },
      { path: 'messages', lazy: () => import('./admin/Messages').then((m) => ({ Component: m.Messages })) },
    ],
  },
]);
