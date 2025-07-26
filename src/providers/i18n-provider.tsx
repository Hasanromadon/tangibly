"use client";

import {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = async (selectedLocale: Locale) => {
    try {
      const messagesModule = await import(`../messages/${selectedLocale}.json`);
      setMessages(messagesModule.default);
      return messagesModule.default;
    } catch (error) {
      console.error("Failed to load messages:", error);
      // Fallback to default locale messages
      const fallbackMessages = await import(
        `../messages/${defaultLocale}.json`
      );
      setMessages(fallbackMessages.default);
      return fallbackMessages.default;
    }
  };

  const setLocale = async (newLocale: Locale) => {
    if (locale === newLocale) return;

    setIsLoading(true);
    localStorage.setItem("locale", newLocale);
    setLocaleState(newLocale);
    await loadMessages(newLocale);
    setIsLoading(false);
  };

  useEffect(() => {
    const initI18n = async () => {
      // Get locale from localStorage or browser settings
      const savedLocale = localStorage.getItem("locale");
      const browserLocale = navigator.language.split("-")[0];

      const selectedLocale: Locale =
        savedLocale && locales.includes(savedLocale as Locale)
          ? (savedLocale as Locale)
          : locales.includes(browserLocale as Locale)
            ? (browserLocale as Locale)
            : defaultLocale;

      setLocaleState(selectedLocale);
      await loadMessages(selectedLocale);
      setIsLoading(false);
    };

    initI18n();
  }, []);

  if (isLoading || !messages) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    isLoading,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
