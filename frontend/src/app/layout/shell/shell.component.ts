import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { BackgroundComponent } from '../../shared/components/background/background.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, BackgroundComponent],
  template: `
    <app-background></app-background>
    <div class="layout">
      <app-sidebar></app-sidebar>
      <main class="main">
        <app-topbar></app-topbar>
        <section class="content">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      height: 100%;
      overflow: hidden;
      background: var(--bg-base);
      color: var(--text);
    }
    .layout {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 232px 1fr;
      height: 100%;
      padding: 16px;
      gap: 16px;
    }
    .main {
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 0;
    }
    .content {
      flex: 1;
      min-height: 0;
      display: flex;
    }
    .content > :first-child {
      flex: 1;
      min-height: 0;
    }
  `],
})
export class ShellComponent {}
