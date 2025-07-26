import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./src/lib/i18n";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale: string = locales.includes(locale as Locale)
    ? locale!
    : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./src/messages/${validLocale}.json`)).default,
  };
});
