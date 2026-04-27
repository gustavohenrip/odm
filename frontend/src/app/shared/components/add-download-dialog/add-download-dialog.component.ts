import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IconComponent } from '../../icons/icons.component';
import { BatchDownloadRequest, DownloadCreateRequest } from '../../../core/api/download.model';

export type AddDialogMode = 'single' | 'batch';

export interface AddDownloadResult {
  mode: AddDialogMode;
  single?: DownloadCreateRequest;
  batch?: BatchDownloadRequest;
}

@Component({
  selector: 'app-add-download-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule, IconComponent],
  template: `
    @if (open) {
      <div class="backdrop" (click)="cancel()"></div>
      <div class="dialog" role="dialog" aria-modal="true">
        <header>
          <div class="title">{{ 'addDialog.title' | translate }}</div>
          <button type="button" class="close" (click)="cancel()" aria-label="close"><app-icon name="x" [size]="14"></app-icon></button>
        </header>

        <div class="tabs">
          <button type="button" [class.active]="mode() === 'single'" (click)="mode.set('single')">{{ 'addDialog.single' | translate }}</button>
          <button type="button" [class.active]="mode() === 'batch'" (click)="mode.set('batch')">{{ 'addDialog.batch' | translate }}</button>
        </div>

        @if (mode() === 'single') {
          <div class="form">
            <label>
              <span>URL</span>
              <input type="text" [(ngModel)]="state.url" placeholder="https://example.com/file.zip" />
            </label>
            <label>
              <span>{{ 'addDialog.mirrors' | translate }}</span>
              <textarea rows="2" [(ngModel)]="state.mirrorsText" [placeholder]="'addDialog.mirrorsHint' | translate"></textarea>
            </label>
            <div class="row">
              <label>
                <span>{{ 'addDialog.segments' | translate }}</span>
                <input type="number" min="1" max="32" [(ngModel)]="state.segments" />
              </label>
              <label>
                <span>{{ 'addDialog.checksumAlgo' | translate }}</span>
                <select [(ngModel)]="state.checksumAlgo">
                  <option value="">—</option>
                  <option value="MD5">MD5</option>
                  <option value="SHA-1">SHA-1</option>
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-512">SHA-512</option>
                </select>
              </label>
            </div>
            @if (state.checksumAlgo) {
              <label>
                <span>{{ 'addDialog.checksumExpected' | translate }}</span>
                <input type="text" [(ngModel)]="state.checksumExpected" placeholder="hex digest" />
              </label>
            }
            <label>
              <span>{{ 'addDialog.folder' | translate }}</span>
              <input type="text" [(ngModel)]="state.folder" [placeholder]="'addDialog.folderHint' | translate" />
            </label>
            <details>
              <summary>{{ 'addDialog.auth' | translate }}</summary>
              <div class="row">
                <label>
                  <span>{{ 'addDialog.username' | translate }}</span>
                  <input type="text" [(ngModel)]="state.username" />
                </label>
                <label>
                  <span>{{ 'addDialog.password' | translate }}</span>
                  <input type="password" [(ngModel)]="state.password" />
                </label>
              </div>
            </details>
          </div>
        } @else {
          <div class="form">
            <label>
              <span>{{ 'addDialog.batchUrls' | translate }}</span>
              <textarea rows="4" [(ngModel)]="state.batchUrlsText" [placeholder]="'addDialog.batchUrlsHint' | translate"></textarea>
            </label>
            <label>
              <span>{{ 'addDialog.pattern' | translate }}</span>
              <input type="text" [(ngModel)]="state.pattern" placeholder="https://host/file[001-100].zip" />
            </label>
            <div class="row">
              <label>
                <span>{{ 'addDialog.segments' | translate }}</span>
                <input type="number" min="1" max="32" [(ngModel)]="state.segments" />
              </label>
              <label>
                <span>{{ 'addDialog.folder' | translate }}</span>
                <input type="text" [(ngModel)]="state.folder" [placeholder]="'addDialog.folderHint' | translate" />
              </label>
            </div>
          </div>
        }

        @if (error()) {
          <div class="error">{{ error() }}</div>
        }

        <footer>
          <button type="button" class="ghost" (click)="cancel()">{{ 'addDialog.cancel' | translate }}</button>
          <button type="button" class="primary" (click)="submit()">{{ 'addDialog.submit' | translate }}</button>
        </footer>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: oklch(0 0 0 / 0.4);
      backdrop-filter: blur(4px);
      z-index: 9000;
    }
    .dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(560px, calc(100vw - 32px));
      max-height: calc(100vh - 64px);
      overflow: auto;
      background: var(--glass-hi);
      border: 1px solid var(--glass-border-2);
      border-radius: 18px;
      padding: 20px;
      z-index: 9001;
      box-shadow: 0 30px 80px oklch(0 0 0 / 0.30);
      color: var(--text);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .title { font-size: 15px; font-weight: 600; flex: 1; }
    .close {
      all: unset;
      cursor: pointer;
      width: 28px; height: 28px;
      display: grid; place-items: center;
      border-radius: 8px;
      color: var(--text-dim);
    }
    .close:hover { background: var(--chip); color: var(--text); }
    .tabs {
      display: flex;
      gap: 6px;
      padding: 3px;
      background: var(--chip);
      border: 1px solid var(--chip-border);
      border-radius: 11px;
    }
    .tabs button {
      all: unset;
      cursor: pointer;
      flex: 1;
      text-align: center;
      padding: 8px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-dim);
    }
    .tabs button.active { background: var(--glass-hi); color: var(--text); border: 1px solid var(--glass-border-2); }
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11.5px;
      color: var(--text-dim);
    }
    .form .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    input, textarea, select {
      width: 100%;
      padding: 8px 12px;
      border-radius: 9px;
      background: var(--chip);
      border: 1px solid var(--chip-border);
      color: var(--text);
      font: inherit;
      font-size: 13px;
      box-sizing: border-box;
    }
    textarea { resize: vertical; min-height: 60px; font-family: var(--font-mono); }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--glass-border-2);
      background: var(--glass-hi);
    }
    details {
      border: 1px dashed var(--chip-border);
      border-radius: 9px;
      padding: 8px 10px;
    }
    details summary {
      cursor: pointer;
      font-size: 12px;
      color: var(--text-dim);
    }
    details[open] summary { margin-bottom: 8px; }
    footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .primary, .ghost {
      all: unset;
      cursor: pointer;
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 550;
    }
    .primary { background: var(--text); color: var(--text-inverse); }
    .ghost { background: var(--chip); border: 1px solid var(--chip-border); color: var(--text-dim); }
    .ghost:hover { background: var(--glass-hi); color: var(--text); }
    .error {
      padding: 10px 12px;
      border-radius: 9px;
      background: var(--selection);
      font-size: 12px;
      color: var(--text);
    }
  `],
})
export class AddDownloadDialogComponent {
  @Input() open = false;
  @Output() submitted = new EventEmitter<AddDownloadResult>();
  @Output() closed = new EventEmitter<void>();

  readonly mode = signal<AddDialogMode>('single');
  readonly error = signal('');

  state = {
    url: '',
    mirrorsText: '',
    segments: 16,
    checksumAlgo: '',
    checksumExpected: '',
    folder: '',
    username: '',
    password: '',
    batchUrlsText: '',
    pattern: '',
  };

  prefillUrl(value: string): void {
    this.mode.set('single');
    this.state.url = value;
    this.error.set('');
  }

  cancel(): void {
    this.error.set('');
    this.closed.emit();
  }

  submit(): void {
    this.error.set('');
    if (this.mode() === 'single') {
      const url = this.state.url.trim();
      if (!url) {
        this.error.set('URL required');
        return;
      }
      const mirrors = this.state.mirrorsText
        .split(/\s+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const single: DownloadCreateRequest = {
        url,
        folder: this.state.folder.trim() || undefined,
        segments: Number(this.state.segments) || undefined,
        mirrors: mirrors.length > 0 ? mirrors : undefined,
        checksumAlgo: this.state.checksumAlgo || undefined,
        checksumExpected: this.state.checksumExpected.trim() || undefined,
        username: this.state.username.trim() || undefined,
        password: this.state.password || undefined,
      };
      this.submitted.emit({ mode: 'single', single });
    } else {
      const urls = this.state.batchUrlsText
        .split(/\s+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const pattern = this.state.pattern.trim();
      if (urls.length === 0 && !pattern) {
        this.error.set('list or pattern required');
        return;
      }
      const batch: BatchDownloadRequest = {
        urls: urls.length > 0 ? urls : undefined,
        pattern: pattern || undefined,
        folder: this.state.folder.trim() || undefined,
        segments: Number(this.state.segments) || undefined,
      };
      this.submitted.emit({ mode: 'batch', batch });
    }
  }

  reset(): void {
    this.state = {
      url: '', mirrorsText: '', segments: 16, checksumAlgo: '', checksumExpected: '',
      folder: '', username: '', password: '', batchUrlsText: '', pattern: '',
    };
    this.mode.set('single');
    this.error.set('');
  }
}
