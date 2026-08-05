"use client";

import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";

export default function AccountLink({ className }: { className?: string }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const initial = (user?.name || user?.email || "A").trim().charAt(0).toUpperCase();
  const image = user?.image && /^(https?:|data:image\/)/i.test(user.image) ? user.image : null;

  return (
    <Link
      className={className}
      data-auth-state={isPending ? "loading" : user ? "authenticated" : "anonymous"}
      href={user ? "/account" : "/login"}
      aria-label={user ? `Open account for ${user.name || user.email}` : "Sign in to your Launchset account"}
      title={user ? user.name || user.email : "Sign in"}
    >
      {user && image && <span aria-hidden="true" data-profile-image style={{ backgroundImage: `url(${JSON.stringify(image)})` }} />}
      {user && !image && <span aria-hidden="true" data-account-initial>{initial}</span>}
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" />
        <path d="M4.75 20.25c.65-3.32 3.2-5.25 7.25-5.25s6.6 1.93 7.25 5.25" />
      </svg>
    </Link>
  );
}
