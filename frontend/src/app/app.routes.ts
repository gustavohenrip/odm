import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'queue' },
      { path: 'queue', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
      { path: 'active', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
      { path: 'queued', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
      { path: 'completed', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
      { path: 'scheduled', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
      { path: 'failed', loadComponent: () => import('./pages/queue/queue.component').then((m) => m.QueueComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
