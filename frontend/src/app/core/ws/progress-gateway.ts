import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { Download } from '../api/download.model';
import { BackendConfigService } from '../api/backend-config.service';

@Injectable({ providedIn: 'root' })
export class ProgressGateway {
  private readonly zone = inject(NgZone);
  private readonly config = inject(BackendConfigService);
  private client: Client | null = null;

  readonly connected = signal(false);
  readonly updates = signal<Download[]>([]);

  connect(): void {
    if (this.client) return;
    const { baseUrl, token } = this.config.snapshot();
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`) as any,
      connectHeaders: token ? { 'X-Adm-Token': token } : {},
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.zone.run(() => this.connected.set(true));
        this.client?.subscribe('/topic/progress', (msg: IMessage) => this.onMessage(msg));
      },
      onDisconnect: () => this.zone.run(() => this.connected.set(false)),
      onStompError: () => this.zone.run(() => this.connected.set(false)),
    });
    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.connected.set(false);
  }

  private onMessage(msg: IMessage): void {
    try {
      const payload = JSON.parse(msg.body) as Download[];
      this.zone.run(() => this.updates.set(payload));
    } catch {}
  }
}
