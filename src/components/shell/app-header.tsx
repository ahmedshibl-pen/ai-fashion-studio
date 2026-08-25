"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  MOCK_PLATFORM_UPDATED_EVENT,
  mockAuthService,
  mockBillingService,
} from "@/lib/mock-platform";
import type { MockUser } from "@/types/mock-platform";

import styles from "./app-header.module.css";

const links = [
  { href: "/studio/basic", label: "Studio", id: "studio" },
  { href: "/projects", label: "Projects", id: "projects" },
  { href: "/account", label: "Account", id: "account" },
] as const;

export function AppHeader({ active = "studio" }: { active?: (typeof links)[number]["id"] }) {
  const [balance, setBalance] = useState(240);
  const [user, setUser] = useState<MockUser | null>(null);

  const refreshAccount = useCallback(() => {
    void Promise.all([mockBillingService.getBalance(), mockAuthService.getSession()]).then(([nextBalance, nextUser]) => {
      setBalance(nextBalance);
      setUser(nextUser);
    });
  }, []);

  useEffect(() => {
    refreshAccount();
    window.addEventListener(MOCK_PLATFORM_UPDATED_EVENT, refreshAccount);
    return () => window.removeEventListener(MOCK_PLATFORM_UPDATED_EVENT, refreshAccount);
  }, [refreshAccount]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <span className={styles.monogram} aria-hidden="true">A</span>
          <span>AI Fashion Studio</span>
        </Link>

        <nav className={styles.navigation} aria-label="Application navigation">
          {links.map((link) => (
            <Link aria-current={link.id === active ? "page" : undefined} href={link.href} key={link.id}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.accountSummary}>
          <span className={styles.saveState}><i aria-hidden="true" /> All changes saved</span>
          <span className={styles.credits}><span aria-hidden="true">✦</span> {balance} credits</span>
          <Link className={styles.avatar} href="/account" aria-label="Open account">{user?.initials ?? "AS"}</Link>
        </div>
      </div>
    </header>
  );
}
