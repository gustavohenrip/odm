import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GlassComponent } from '../../shared/components/glass/glass.component';
import { SUPPORTED_LANGUAGES } from '../../core/i18n/translate-loader.factory';
import { ThemeService } from '../../core/theme/theme.service';

interface SettingsState {
  downloadRoot: string;
  defaultSegments: number;
  rateLimitKbps: number;
  proxyKind: 'NONE' | 'HTTP' | 'SOCKS';
  proxyHost: string;
  proxyPort: number;
  clipboardWatch: boolean;
  trayEnabled: boolean;
  autoUpdate: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, GlassComponent],
  template: `
    <app-glass [radius]="18">
      <div class="page">
        <h2>{{ 'settings.title' | translate }}</h2>

        <section>
          <h3>{{ 'settings.appearance' | translate }}</h3>
          <div class="row">
            <label>{{ 'settings.theme' | translate }}</label>
            <select [value]="theme()" (change)="setTheme($any($event.target).value)">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div class="row">
            <label>{{ 'settings.language' | translate }}</label>
            <select [value]="currentLang()" (change)="setLang($any($event.target).value)">
              @for (l of languages; track l.code) {
                <option [value]="l.code">{{ l.label }}</option>
              }
            </select>
          </div>
        </section>

        <section>
          <h3>{{ 'settings.downloads' | translate }}</h3>
          <div class="row">
            <label>{{ 'settings.downloadRoot' | translate }}</label>
            <input type="text" [(ngModel)]="state.downloadRoot" />
          </div>
          <div class="row">
            <label>{{ 'settings.defaultSegments' | translate }}</label>
            <input type="number" min="1" max="32" [(ngModel)]="state.defaultSegments" />
          </div>
          <div class="row">
            <label>{{ 'settings.rateLimit' | translate }}</label>
            <input type="number" min="0" [(ngModel)]="state.rateLimitKbps" />
            <span class="unit">KB/s</span>
          </div>
        </section>

        <section>
          <h3>{{ 'settings.network' | translate }}</h3>
          <div class="row">
            <label>{{ 'settings.proxy' | translate }}</label>
            <select [(ngModel)]="state.proxyKind">
              <option value="NONE">None</option>
              <option value="HTTP">HTTP</option>
              <option value="SOCKS">SOCKS</option>
            </select>
          </div>
          @if (state.proxyKind !== 'NONE') {
            <div class="row">
              <label>Host</label>
              <input type="text" [(ngModel)]="state.proxyHost" />
            </div>
            <div class="row">
              <label>Port</label>
              <input type="number" [(ngModel)]="state.proxyPort" />
            </div>
          }
        </section>

        <section>
          <h3>{{ 'settings.system' | translate }}</h3>
          <div class="row">
            <label>{{ 'settings.clipboard' | translate }}</label>
            <input type="checkbox" [(ngModel)]="state.clipboardWatch" />
          </div>
          <div class="row">
            <label>{{ 'settings.tray' | translate }}</label>
            <input type="checkbox" [(ngModel)]="state.trayEnabled" />
          </div>
          <div class="row">
            <label>{{ 'settings.autoUpdate' | translate }}</label>
            <input type="checkbox" [(ngModel)]="state.autoUpdate" />
          </div>
        </section>

        <button class="save" type="button" (click)="save()">{{ 'settings.save' | translate }}</button>
      </div>
    </app-glass>
  `,
  styles: [`
    :host { display: flex; flex: 1; min-height: 0; }
    :host ::ng-deep app-glass { flex: 1; display: flex; }
    .page {
      padding: 28px 36px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
      color: var(--text);
    }
    h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.3px; margin: 0; }
    h3 {
      font-size: 11px;
      color: var(--text-subtle);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-weight: 500;
      margin: 0 0 6px;
    }
    section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 18px 20px;
      background: var(--glass-hi);
      border: 1px solid var(--glass-border-2);
      border-radius: 14px;
    }
    .row {
      display: grid;
      grid-template-columns: 220px 1fr auto;
      align-items: center;
      gap: 16px;
      font-size: 13px;
    }
    label { color: var(--text-dim); }
    input[type="text"], input[type="number"], select {
      width: 100%;
      padding: 8px 12px;
      border-radius: 9px;
      background: var(--chip);
      border: 1px solid var(--chip-border);
      color: var(--text);
      font: inherit;
    }
    input[type="checkbox"] { accent-color: var(--fill); }
    .unit { font-family: var(--font-mono); color: var(--text-subtle); font-size: 11px; }
    .save {
      align-self: flex-start;
      padding: 10px 18px;
      border-radius: 11px;
      background: var(--text);
      color: var(--text-inverse);
      border: 0;
      font-weight: 550;
      font-size: 13px;
    }
  `],
})
export class SettingsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly translate = inject(TranslateService);

  readonly theme = this.themeService.theme;
  readonly currentLang = signal(this.translate.currentLang || 'en');
  readonly languages = SUPPORTED_LANGUAGES;

  state: SettingsState = {
    downloadRoot: '~/Downloads/ADM',
    defaultSegments: 8,
    rateLimitKbps: 0,
    proxyKind: 'NONE',
    proxyHost: '',
    proxyPort: 0,
    clipboardWatch: true,
    trayEnabled: true,
    autoUpdate: true,
  };

  setTheme(value: 'light' | 'dark') {
    this.themeService.set(value);
  }

  setLang(code: string) {
    this.translate.use(code);
    this.currentLang.set(code);
    const rtl = this.languages.find((l) => l.code === code)?.rtl;
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  }

  save() {}
}
