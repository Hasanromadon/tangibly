"use client";

import { Suspense } from "react";
import { AcceptInvitationForm } from "./AcceptInvitationForm";

export default function AcceptInvitationPage() {
  return (
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
  );
}
