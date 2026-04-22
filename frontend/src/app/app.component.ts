import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './core/i18n/translate-loader.factory';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    const supported = SUPPORTED_LANGUAGES.map((l) => l.code);
    this.translate.addLangs(supported);
    const browser = this.translate.getBrowserCultureLang() ?? DEFAULT_LANGUAGE;
    const initial = supported.find((c) => c === browser) ?? supported.find((c) => browser.startsWith(c.split('-')[0])) ?? DEFAULT_LANGUAGE;
    this.translate.use(initial);
  }
}
