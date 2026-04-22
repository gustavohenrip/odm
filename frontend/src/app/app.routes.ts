import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'queue' },
  { path: 'queue', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
  { path: 'completed', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
  { path: 'scheduled', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
  { path: 'settings', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
  { path: '**', redirectTo: 'queue' },
];
