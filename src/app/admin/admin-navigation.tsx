"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const items = [
  { href: "/admin", label: "Overview", number: "01" },
  { href: "/admin/clients", label: "Clients", number: "02" },
  { href: "/admin/contracts", label: "Contracts", number: "03" },
  { href: "/admin/payments", label: "Payments", number: "04" },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin navigation">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            className={active ? styles.active : undefined}
            href={item.href}
            key={item.href}
          >
            <span>{item.number}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
