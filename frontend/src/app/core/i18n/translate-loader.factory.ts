import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function translateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'pt-BR', label: 'Português (BR)', rtl: false },
  { code: 'es', label: 'Español', rtl: false },
  { code: 'fr', label: 'Français', rtl: false },
  { code: 'de', label: 'Deutsch', rtl: false },
  { code: 'it', label: 'Italiano', rtl: false },
  { code: 'ru', label: 'Русский', rtl: false },
  { code: 'zh', label: '中文', rtl: false },
  { code: 'ja', label: '日本語', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
] as const;

export const DEFAULT_LANGUAGE = 'en';
