"use client";

import { useI18n } from "@/providers/i18n-provider";
import { locales, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const localeNames: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export function LanguageSwitcher() {
  const { locale, setLocale, isLoading } = useI18n();

  const handleLocaleChange = async (newLocale: Locale) => {
    await setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Globe className="mr-2 h-4 w-4" />
          {localeNames[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(loc => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CompactLanguageSwitcher() {
  const { locale, setLocale, isLoading } = useI18n();

  const toggleLocale = async () => {
    const newLocale = locale === "en" ? "id" : "en";
    await setLocale(newLocale);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      disabled={isLoading}
      className="h-8 w-12 p-0"
    >
      {locale.toUpperCase()}
    </Button>
  );
}
