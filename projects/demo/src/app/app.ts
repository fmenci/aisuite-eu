import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DEMO_PAGES } from './app.routes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar navbar-dark bg-dark px-3">
      <span class="navbar-brand">&#64;aisuite-eu/ngtools <small class="text-light">demo</small></span>
    </header>
    <div class="demo-layout">
      <nav class="demo-nav nav flex-column" aria-label="Components">
        @for (page of pages; track page.path) {
          <a class="nav-link" [routerLink]="page.path" routerLinkActive="active">
            <i class="fas fa-fw {{ page.icon }}"></i> {{ page.title }}
          </a>
        }
      </nav>
      <main class="demo-main"><router-outlet /></main>
    </div>
  `,
  styleUrl: './app.less'
})
export class App {
  protected readonly pages = DEMO_PAGES;
}
