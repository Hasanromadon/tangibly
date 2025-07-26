"use client";

import { Suspense } from "react";
import dynamicImport from "next/dynamic";
import { AcceptInvitationForm } from "./AcceptInvitationForm";

// Dynamically import the language switcher to avoid SSR issues
const CompactLanguageSwitcher = dynamicImport(
  () =>
    import("@/components/common/language-switcher").then(mod => ({
      default: mod.CompactLanguageSwitcher,
    })),
  { ssr: false }
);

export default function AcceptInvitationPage() {
  return (
    <div className="relative">
      {/* Language switcher in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <CompactLanguageSwitcher />
      </div>

      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <AcceptInvitationForm />
      </Suspense>
    </div>
  );
}
