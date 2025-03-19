import { createRouter, createWebHistory } from 'vue-router';

import createRouteGuard from './guard';

const routes = [
  {
    path: '/',
    redirect: '/connect',
  },
  {
    path: '/connect',
    name: 'connect',
    component: () => import('@/views/connect/index.vue'),
  },
  {
    path: '/performance',
    name: 'performance',
    component: () => import('@/views/performance/index.vue'),
  },
  {
    path: '/key-assignment',
    name: 'keyAssignment',
    component: () => import('@/views/key-assignment/index.vue'),
  },
  {
    path: '/lighting',
    name: 'lighting',
    component: () => import('@/views/lighting/index.vue'),
  },
  {
    path: '/key-calibration',
    name: 'keyCalibration',
    component: () => import('@/views/key-calibration/index.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

createRouteGuard(router);

export default router;
