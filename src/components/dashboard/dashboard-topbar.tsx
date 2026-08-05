"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import styles from "./dashboard-topbar.module.css";

type DashboardTopbarProps = {
  email: string;
  image?: string | null;
  name?: string | null;
};

export default function DashboardTopbar({ email, image, name }: DashboardTopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = name?.trim() || email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const signOut = () => authClient.signOut({
    fetchOptions: { onSuccess: () => { window.location.href = "/"; } },
  });

  return (
    <header className={styles.bar}>
      <Link className={styles.brand} href="/" aria-label="Launchset home">LAUNCHSET<span>.</span></Link>
      <div className={styles.profile} ref={menuRef}>
        <button aria-expanded={open} aria-haspopup="menu" className={styles.profileButton} onClick={() => setOpen((value) => !value)} type="button">
          <span className={styles.name}>{displayName}</span>
          <span className={styles.avatar} style={image ? { backgroundImage: `url(${JSON.stringify(image)})` } : undefined}>{!image && initial}</span>
        </button>
        {open && <div className={styles.menu} role="menu"><button onClick={signOut} role="menuitem" type="button">Log out</button></div>}
      </div>
    </header>
  );
}
