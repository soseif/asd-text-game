/**
 * i18n: English as source of truth, Chinese as display layer.
 * Default language: English ('en'). locale 'zh' = use zh translations.
 */
import React, { createContext, useContext, useState } from 'react';
import { zh } from '../locales/zh.js';

const DEFAULT_LOCALE = 'en';
const LocaleContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {} });

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem('cyber-hell-locale') || DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const setLocaleAndStore = (next) => {
    setLocale(next);
    try {
      localStorage.setItem('cyber-hell-locale', next);
    } catch {}
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: setLocaleAndStore }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

/** Merge storyBeats: keep source structure, overlay zh text when locale is zh */
export function getLocalizedStoryBeats(sourceBeats, locale) {
  if (locale !== 'zh' || !zh.storyBeats) return sourceBeats;
  const zhBeats = zh.storyBeats;
  return sourceBeats.map((beat, i) => {
    const zhBeat = zhBeats[i];
    if (!zhBeat) return beat;
    return {
      ...beat,
      title: zhBeat.title ?? beat.title,
      narrativeText: zhBeat.narrativeText ?? beat.narrativeText,
      conditionalNarrative: zhBeat.conditionalNarrative ?? beat.conditionalNarrative,
      bridgeText: zhBeat.bridgeText ?? beat.bridgeText,
      choices: beat.choices.map((c, j) => {
        const zhChoice = zhBeat.choices?.[j];
        if (!zhChoice) return c;
        return {
          ...c,
          actionText: zhChoice.actionText ?? c.actionText,
          impactHint: zhChoice.impactHint ?? c.impactHint,
          consequenceText: zhChoice.consequenceText ?? c.consequenceText,
          disabledReason: zhChoice.disabledReason ?? c.disabledReason,
        };
      }),
    };
  });
}

/** Merge diagnosticReport: overlay zh when locale is zh */
export function getLocalizedDiagnosticReport(sourceReport, locale) {
  if (locale !== 'zh' || !zh.diagnosticReport) return sourceReport;
  return mergeDeep(sourceReport, zh.diagnosticReport);
}

function mergeDeep(target, overlay) {
  const out = { ...target };
  for (const k of Object.keys(overlay || {})) {
    const v = overlay[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof target[k] === 'object' && !Array.isArray(target[k])) {
      out[k] = mergeDeep(target[k], v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

/** Get intro text by index (0..8) */
export function getIntroText(index, locale) {
  if (locale === 'zh' && zh.intro?.texts?.[index] != null) return zh.intro.texts[index];
  return null; // caller should pass EN fallback
}

/** Get intro label by index */
export function getIntroLabel(index, locale) {
  if (locale === 'zh' && zh.intro?.labels?.[index] != null) return zh.intro.labels[index];
  return null;
}

/** Get spam message text (by id) */
export function getSpamMessageText(msg, locale) {
  if (locale !== 'zh') return msg.text;
  const m = zh.spamMessages?.find((x) => x.id === msg.id);
  return m?.text ?? msg.text;
}

/** Get waiting message by index */
export function getWaitingMessage(index, locale) {
  if (locale === 'zh' && zh.waitingMessages?.[index] != null) return zh.waitingMessages[index];
  return null;
}

/** Simple UI string lookup: t(key, locale, enFallback) */
export function t(key, locale, enFallback) {
  if (locale === 'zh' && zh.ui?.[key]) return zh.ui[key];
  return enFallback ?? key;
}
