import { createI18n } from 'vue-i18n';
import type { Locale } from 'date-fns';
import { enUS, es, fr, ja } from 'date-fns/locale';

import { app as enApp } from './en/app';
import { auth as enAuth } from './en/auth';
import { deviceCard as enDeviceCard } from './en/deviceCard';
import { statusBadge as enStatusBadge } from './en/statusBadge';
import { app as esApp } from './es/app';
import { auth as esAuth } from './es/auth';
import { deviceCard as esDeviceCard } from './es/deviceCard';
import { statusBadge as esStatusBadge } from './es/statusBadge';
import { app as frApp } from './fr/app';
import { auth as frAuth } from './fr/auth';
import { deviceCard as frDeviceCard } from './fr/deviceCard';
import { statusBadge as frStatusBadge } from './fr/statusBadge';
import { app as jaApp } from './ja/app';
import { auth as jaAuth } from './ja/auth';
import { deviceCard as jaDeviceCard } from './ja/deviceCard';
import { statusBadge as jaStatusBadge } from './ja/statusBadge';

export const supportedLocales = ['en', 'es', 'fr', 'ja'] as const;
export type LocaleCode = (typeof supportedLocales)[number];

export const localeStorageKey = 'dm_locale';

export const normalizeLocale = (value?: string | null): LocaleCode => {
  const candidate = (value || 'en').toLowerCase();
  if (candidate.startsWith('es')) return 'es';
  if (candidate.startsWith('fr')) return 'fr';
  if (candidate.startsWith('ja') || candidate.startsWith('jp')) return 'ja';
  if (candidate.startsWith('en')) return 'en';
  return 'en';
};

export const getStoredLocale = (): LocaleCode => {
  if (typeof localStorage === 'undefined') {
    return 'en';
  }

  return normalizeLocale(localStorage.getItem(localeStorageKey));
};

export const setStoredLocale = (value: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(localeStorageKey, normalizeLocale(value));
  }
};

export const messages = {
  en: { app: enApp, auth: enAuth, deviceCard: enDeviceCard, statusBadge: enStatusBadge },
  es: { app: esApp, auth: esAuth, deviceCard: esDeviceCard, statusBadge: esStatusBadge },
  fr: { app: frApp, auth: frAuth, deviceCard: frDeviceCard, statusBadge: frStatusBadge },
  ja: { app: jaApp, auth: jaAuth, deviceCard: jaDeviceCard, statusBadge: jaStatusBadge },
} as const;

export const i18n = createI18n({
  legacy: false,
  locale: getStoredLocale(),
  fallbackLocale: 'en',
  messages,
});

export const setLocale = (value: string) => {
  const normalized = normalizeLocale(value);
  i18n.global.locale.value = normalized;
  setStoredLocale(normalized);
};

export const getDateFnsLocale = (value: string): Locale => {
  const locale = normalizeLocale(value);
  if (locale === 'es') return es;
  if (locale === 'fr') return fr;
  if (locale === 'ja') return ja;
  return enUS;
};
