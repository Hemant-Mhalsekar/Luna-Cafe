import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { ComingSoon } from './pages/ComingSoon';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'games', element: <ComingSoon eyebrow="The game shelf" title="Find your next favourite game" intro="Filter by players, time and mood, or take the quiz and let us pick." /> },
      { path: 'menu', element: <ComingSoon eyebrow="Menu" title="Coffee, tea and things to share" intro="Drinks and bakes made for long game nights, with vegan and gluten-free options marked." /> },
      { path: 'book', element: <ComingSoon eyebrow="Book a table" title="Your table is waiting" intro="Pick a day, a time and how many of you are coming. You can reserve a game too." /> },
      { path: 'events', element: <ComingSoon eyebrow="Events" title="Game nights and tournaments" intro="Join a table of new friends, or bring your crew and compete." /> },
      { path: 'about', element: <ComingSoon eyebrow="About" title="A café that happens to have a lot of games" intro="How Luna Café started, who makes your coffee, and what we care about." /> },
      { path: 'contact', element: <ComingSoon eyebrow="Contact" title="Say hello" intro="Questions, big groups or private events: send us a note." /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
