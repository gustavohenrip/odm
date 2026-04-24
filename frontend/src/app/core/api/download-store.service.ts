import { Injectable, effect, inject, signal } from '@angular/core';

import { Download } from './download.model';
import { DownloadsService } from './downloads.service';
import { ProgressGateway } from '../ws/progress-gateway';

@Injectable({ providedIn: 'root' })
export class DownloadStore {
  private readonly downloadsService = inject(DownloadsService);
  private readonly progressGateway = inject(ProgressGateway);
  private readonly state = signal<Download[]>([]);

  readonly downloads = this.state.asReadonly();

  constructor() {
    effect(() => {
      const updates = this.progressGateway.updates();
      if (!updates.length) return;
      for (const update of updates) this.mergeOne(update);
    }, { allowSignalWrites: true });
  }

  load(): void {
    this.downloadsService.list().subscribe((items) => this.state.set(items));
  }

  mergeOne(update: Download): void {
    this.state.update((items) => {
      const index = items.findIndex((item) => item.id === update.id);
      if (index < 0) return [update, ...items];
      const next = [...items];
      next[index] = { ...next[index], ...update };
      return next;
    });
  }

  removeLocal(id: string): void {
    this.state.update((items) => items.filter((item) => item.id !== id));
  }
}
