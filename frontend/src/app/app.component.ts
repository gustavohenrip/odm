import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './core/i18n/translate-loader.factory';
import { BackendConfigService } from './core/api/backend-config.service';
import { ProgressGateway } from './core/ws/progress-gateway';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly backendConfig = inject(BackendConfigService);
  private readonly progressGateway = inject(ProgressGateway);

  async ngOnInit(): Promise<void> {
    await this.backendConfig.load();
    this.progressGateway.connect();
    const supported = SUPPORTED_LANGUAGES.map((l) => l.code);
    this.translate.addLangs(supported);
    const browser = this.translate.getBrowserCultureLang() ?? DEFAULT_LANGUAGE;
    const initial = supported.find((c) => c === browser) ?? supported.find((c) => browser.startsWith(c.split('-')[0])) ?? DEFAULT_LANGUAGE;
    this.translate.use(initial);
  }
}
