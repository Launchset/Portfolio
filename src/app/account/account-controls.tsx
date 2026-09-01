"use client";

import { authClient } from "@/src/lib/auth-client";

export default function AccountControls() {
  return (
    <button
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        })
      }
      type="button"
    >
      Sign out
    </button>
  );
}
