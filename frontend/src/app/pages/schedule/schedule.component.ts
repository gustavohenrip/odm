import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { GlassComponent } from '../../shared/components/glass/glass.component';
import { IconComponent } from '../../shared/icons/icons.component';
import { DownloadsService } from '../../core/api/downloads.service';
import { ScheduleRule } from '../../core/api/download.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule, GlassComponent, IconComponent],
  template: `
    <app-glass [radius]="18">
      <div class="page">
        <header>
          <h2>{{ 'schedule.title' | translate }}</h2>
          <button type="button" class="primary" (click)="addNew()"><app-icon name="plus" [size]="13"></app-icon><span>{{ 'schedule.add' | translate }}</span></button>
        </header>

        @if (loading()) {
          <div class="empty">{{ 'schedule.loading' | translate }}</div>
        } @else if (rules().length === 0) {
          <div class="empty">{{ 'schedule.empty' | translate }}</div>
        } @else {
          <div class="rules">
            @for (rule of rules(); track rule.id) {
              <div class="rule">
                <div class="head">
                  <input class="label" type="text" [(ngModel)]="rule.label" [placeholder]="'schedule.label' | translate" />
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="rule.enabled" />
                    <span>{{ rule.enabled ? ('schedule.enabled' | translate) : ('schedule.disabled' | translate) }}</span>
                  </label>
                </div>
                <div class="grid">
                  <label>
                    <span>{{ 'schedule.cronStart' | translate }}</span>
                    <input type="text" [(ngModel)]="rule.cronStart" placeholder="0 0 22 * * ?" />
                  </label>
                  <label>
                    <span>{{ 'schedule.cronPause' | translate }}</span>
                    <input type="text" [(ngModel)]="rule.cronPause" placeholder="0 0 7 * * ?" />
                  </label>
                  <label>
                    <span>{{ 'schedule.rateLimit' | translate }}</span>
                    <input type="number" min="0" [(ngModel)]="rule.rateLimitKbps" placeholder="KB/s" />
                  </label>
                  <label class="check">
                    <input type="checkbox" [(ngModel)]="rule.shutdownAfter" />
                    <span>{{ 'schedule.shutdownAfter' | translate }}</span>
                  </label>
                </div>
                <div class="row-actions">
                  <button type="button" class="ghost" (click)="remove(rule)"><app-icon name="trash" [size]="12"></app-icon></button>
                  <button type="button" class="primary" (click)="save(rule)">{{ 'schedule.save' | translate }}</button>
                </div>
              </div>
            }
          </div>
        }
        @if (status()) {
          <div class="status" [class.err]="!!err()">{{ status() }}</div>
        }
      </div>
    </app-glass>
  `,
  styles: [`
    :host { display: flex; flex: 1; min-height: 0; }
    :host ::ng-deep app-glass { flex: 1; display: flex; }
    .page {
      padding: 28px 36px;
      overflow: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 18px;
      color: var(--text);
    }
    header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.3px; margin: 0; flex: 1; }
    .primary, .ghost {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 550;
    }
    .primary { background: var(--text); color: var(--text-inverse); }
    .ghost { background: var(--chip); border: 1px solid var(--chip-border); color: var(--text-dim); }
    .ghost:hover { background: var(--glass-hi); color: var(--text); }
    .rules {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .rule {
      padding: 16px 18px;
      background: var(--glass-hi);
      border: 1px solid var(--glass-border-2);
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .head {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .head .label {
      flex: 1;
      padding: 8px 12px;
      border-radius: 9px;
      background: var(--chip);
      border: 1px solid var(--chip-border);
      color: var(--text);
      font: inherit;
      font-size: 13px;
      font-weight: 550;
    }
    .toggle {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 12px;
      color: var(--text-dim);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .grid label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11px;
      color: var(--text-dim);
    }
    .grid label.check {
      flex-direction: row;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    .grid input {
      padding: 8px 12px;
      border-radius: 9px;
      background: var(--chip);
      border: 1px solid var(--chip-border);
      color: var(--text);
      font: inherit;
      font-size: 13px;
      box-sizing: border-box;
      width: 100%;
    }
    .row-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .empty {
      padding: 30px;
      text-align: center;
      color: var(--text-subtle);
      font-size: 13px;
    }
    .status {
      font-size: 12px;
      color: var(--text-dim);
    }
    .status.err { color: var(--text); }
    @media (max-width: 760px) {
      .page { padding: 18px; }
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ScheduleComponent implements OnInit {
  private readonly api = inject(DownloadsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly rules = signal<ScheduleRule[]>([]);
  readonly loading = signal(true);
  readonly status = signal('');
  readonly err = signal(false);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.api.scheduleRules().subscribe({
      next: (rules) => {
        this.rules.set(rules);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.err.set(true);
        this.status.set('Could not load rules');
        this.cdr.markForCheck();
      },
    });
  }

  addNew(): void {
    const fresh: ScheduleRule = { enabled: true, cronStart: '', cronPause: '', label: '', shutdownAfter: false };
    this.rules.update((list) => [...list, fresh]);
  }

  save(rule: ScheduleRule): void {
    this.err.set(false);
    this.status.set('');
    this.api.saveScheduleRule(rule).subscribe({
      next: () => {
        this.status.set('Saved');
        this.reload();
      },
      error: () => {
        this.err.set(true);
        this.status.set('Save failed');
        this.cdr.markForCheck();
      },
    });
  }

  remove(rule: ScheduleRule): void {
    if (rule.id == null) {
      this.rules.update((list) => list.filter((r) => r !== rule));
      return;
    }
    this.api.deleteScheduleRule(rule.id).subscribe({
      next: () => this.reload(),
      error: () => {
        this.err.set(true);
        this.status.set('Delete failed');
        this.cdr.markForCheck();
      },
    });
  }
}
