"use client";

import {
  useTranslations as useNextIntlTranslations,
  useLocale,
} from "next-intl";
import { type Locale } from "@/lib/i18n";

// Re-export useTranslations from next-intl for convenience
export { useTranslations } from "next-intl";

// Custom hook for getting current locale
export function useCurrentLocale(): Locale {
  return useLocale() as Locale;
}

// Custom hook for auth translations
export function useAuthTranslations() {
  return useNextIntlTranslations("auth");
}

// Custom hook for common translations
export function useCommonTranslations() {
  return useNextIntlTranslations("common");
}

// Custom hook for navigation translations
export function useNavigationTranslations() {
  return useNextIntlTranslations("navigation");
}

// Custom hook for asset translations
export function useAssetTranslations() {
  return useNextIntlTranslations("assets");
}

// Custom hook for company translations
export function useCompanyTranslations() {
  return useNextIntlTranslations("companies");
}

// Custom hook for user translations
export function useUserTranslations() {
  return useNextIntlTranslations("users");
}

// Custom hook for error translations
export function useErrorTranslations() {
  return useNextIntlTranslations("errors");
}

// Custom hook for validation translations
export function useValidationTranslations() {
  return useNextIntlTranslations("validation");
}

// Utility function to get browser locale
export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem("locale") as Locale;
  if (stored && ["en", "id"].includes(stored)) {
    return stored;
  }

  const browserLang = navigator.language.split("-")[0];
  return browserLang === "id" ? "id" : "en";
}

// Utility function to set locale
export function setLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem("locale", locale);
}
