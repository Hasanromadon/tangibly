"use client";

import { useI18n } from "@/providers/i18n-provider";
import {
  LanguageSwitcher,
  CompactLanguageSwitcher,
} from "@/components/language-switcher";
import {
  useAuthTranslations,
  useCommonTranslations,
} from "@/hooks/useTranslations";
import { Card } from "@/components/ui/card";

export default function I18nDemoPage() {
  const { locale, isLoading } = useI18n();
  const authT = useAuthTranslations();
  const commonT = useCommonTranslations();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold">
            i18n Demo - LocalStorage Implementation
          </h1>
          <p className="text-gray-600">
            Language preference is stored in localStorage, not in URL path
            segments.
          </p>
        </div>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Current Settings</h2>
          <div className="space-y-2">
            <p>
              <strong>Current Locale:</strong> {locale}
            </p>
            <p>
              <strong>LocalStorage Value:</strong>{" "}
              {typeof window !== "undefined"
                ? localStorage.getItem("locale") || "not set"
                : "server"}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Language Switchers</h2>
          <div className="flex gap-4">
            <LanguageSwitcher />
            <CompactLanguageSwitcher />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Sample Translations</h2>
          <div className="space-y-2">
            <div>
              <strong>Auth translations:</strong>
              <ul className="mt-2 ml-4 list-inside list-disc">
                <li>Login title: {authT("login.title")}</li>
                <li>Email: {authT("login.email")}</li>
                <li>Password: {authT("login.password")}</li>
                <li>Submit: {authT("login.submit")}</li>
              </ul>
            </div>

            <div className="mt-4">
              <strong>Common translations:</strong>
              <ul className="mt-2 ml-4 list-inside list-disc">
                <li>Save: {commonT("save")}</li>
                <li>Cancel: {commonT("cancel")}</li>
                <li>Loading: {commonT("loading")}</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Features</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>✅ Language preference saved in localStorage</li>
            <li>✅ No locale in URL path segments</li>
            <li>✅ Auto-detects browser language on first visit</li>
            <li>✅ Persistent across page reloads</li>
            <li>✅ Real-time language switching without page refresh</li>
            <li>✅ Fallback to English if translation missing</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
