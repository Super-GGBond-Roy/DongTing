import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { EntryDetail } from '../modules/entries/EntryDetail';
import { AboutPage } from '../modules/about/AboutPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
  },
  {
    path: '/entry/:id',
    element: <EntryDetail />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
]);
