import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

// Home is part of the first download; every other page loads its code when first visited.
const comingSoon = (eyebrow: string, title: string, intro: string) => async () => {
  const { ComingSoon } = await import('./pages/ComingSoon');
  return { Component: () => <ComingSoon eyebrow={eyebrow} title={title} intro={intro} /> };
};

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'games', lazy: comingSoon('The game shelf', 'Find your next favourite game', 'Filter by players, time and mood, or take the quiz and let us pick.') },
      { path: 'menu', lazy: comingSoon('Menu', 'Coffee, tea and things to share', 'Drinks and bakes made for long game nights, with vegan and gluten-free options marked.') },
      { path: 'book', lazy: comingSoon('Book a table', 'Your table is waiting', 'Pick a day, a time and how many of you are coming. You can reserve a game too.') },
      { path: 'events', lazy: comingSoon('Events', 'Game nights and tournaments', 'Join a table of new friends, or bring your crew and compete.') },
      { path: 'about', lazy: comingSoon('About', 'A café that happens to have a lot of games', 'How Luna Café started, who makes your coffee, and what we care about.') },
      { path: 'contact', lazy: comingSoon('Contact', 'Say hello', 'Questions, big groups or private events: send us a note.') },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
