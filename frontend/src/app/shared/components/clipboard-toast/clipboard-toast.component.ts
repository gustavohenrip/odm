import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { IconComponent } from '../../icons/icons.component';

@Component({
  selector: 'app-clipboard-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IconComponent],
  template: `
    @if (url) {
      <div class="toast" role="status">
        <div class="icon"><app-icon name="link" [size]="14"></app-icon></div>
        <div class="body">
          <div class="title">{{ 'clipboard.detected' | translate }}</div>
          <div class="url" [title]="url">{{ url }}</div>
        </div>
        <div class="actions">
          <button type="button" class="primary" (click)="accept.emit(url)">{{ 'clipboard.download' | translate }}</button>
          <button type="button" class="ghost" (click)="dismiss.emit()">{{ 'clipboard.dismiss' | translate }}</button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 22px;
      right: 22px;
      z-index: 9999;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: grid;
      grid-template-columns: 28px minmax(220px, 320px) auto;
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      border-radius: 14px;
      background: var(--glass-hi);
      border: 1px solid var(--glass-border-2);
      box-shadow: 0 18px 40px oklch(0 0 0 / 0.18);
      backdrop-filter: blur(18px);
      animation: slideIn 0.22s ease;
    }
    @keyframes slideIn {
      from { transform: translateY(8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .icon {
      width: 28px; height: 28px;
      border-radius: 9px;
      display: grid; place-items: center;
      background: var(--chip);
      border: 1px solid var(--chip-border);
      color: var(--text-dim);
    }
    .title {
      font-size: 12px;
      font-weight: 550;
      color: var(--text);
    }
    .url {
      font-size: 11px;
      color: var(--text-dim);
      font-family: var(--font-mono);
      max-width: 320px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .actions { display: flex; gap: 6px; }
    .primary, .ghost {
      all: unset;
      cursor: pointer;
      font-size: 12px;
      font-weight: 550;
      padding: 7px 12px;
      border-radius: 9px;
      letter-spacing: -0.1px;
    }
    .primary {
      background: var(--text);
      color: var(--text-inverse);
    }
    .primary:hover { opacity: 0.92; }
    .ghost {
      color: var(--text-dim);
      border: 1px solid var(--chip-border);
      background: var(--chip);
    }
    .ghost:hover { background: var(--glass-hi); color: var(--text); }
  `],
})
export class ClipboardToastComponent {
  @Input() url: string | null = null;
  @Output() accept = new EventEmitter<string>();
  @Output() dismiss = new EventEmitter<void>();
}
