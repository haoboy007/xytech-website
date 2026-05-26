import HomePage from './pages/HomePage';
import PartnerPage from './pages/PartnerPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: '合伙人招募',
    path: '/partner',
    element: <PartnerPage />,
    public: true,
  },
];
