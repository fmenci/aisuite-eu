import { Routes } from '@angular/router';

export interface DemoRoute { path: string; title: string; icon: string; }

/** Menu of the demo, one lazy page per family of components */
export const DEMO_PAGES: DemoRoute[] = [
  { path: 'inputs', title: 'Value inputs', icon: 'fa-keyboard' },
  { path: 'lists', title: 'Lists and icons', icon: 'fa-list' },
  { path: 'lingua', title: 'Languages', icon: 'fa-flag' },
  { path: 'linsce', title: 'LinSce labels', icon: 'fa-tags' },
  { path: 'doko', title: 'Document upload', icon: 'fa-file-arrow-up' },
  { path: 'helpers', title: 'Validators and helpers', icon: 'fa-check-double' }
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inputs' },
  { path: 'inputs', title: 'Value inputs', loadComponent: () => import('./pages/inputs.page').then(m => m.InputsPage) },
  { path: 'lists', title: 'Lists and icons', loadComponent: () => import('./pages/lists.page').then(m => m.ListsPage) },
  { path: 'lingua', title: 'Languages', loadComponent: () => import('./pages/lingua.page').then(m => m.LinguaPage) },
  { path: 'linsce', title: 'LinSce labels', loadComponent: () => import('./pages/linsce.page').then(m => m.LinscePage) },
  { path: 'doko', title: 'Document upload', loadComponent: () => import('./pages/doko.page').then(m => m.DokoPage) },
  { path: 'helpers', title: 'Validators and helpers', loadComponent: () => import('./pages/helpers.page').then(m => m.HelpersPage) },
  { path: '**', redirectTo: 'inputs' }
];
