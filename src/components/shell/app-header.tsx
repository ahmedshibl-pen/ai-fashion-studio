"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const router = useRouter();
  const [balance, setBalance] = useState(240);
  const [user, setUser] = useState<MockUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnPointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const signOut = async () => {
    await mockAuthService.signOut();
    setMenuOpen(false);
    router.push("/");
  };

  const signIn = async () => {
    await mockAuthService.signInWithGoogle();
    refreshAccount();
    setMenuOpen(false);
  };

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
          <div className={styles.accountMenu} ref={menuRef}>
            <button className={styles.avatar} type="button" aria-label="Open account menu" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{user?.initials ?? "AS"}</button>
            {menuOpen ? (
              <div className={styles.menuPanel} role="menu">
                <div><strong>{user?.name ?? "Studio guest"}</strong><span>{user?.email ?? "Local prototype session"}</span></div>
                <Link role="menuitem" href="/account" onClick={() => setMenuOpen(false)}>Account & Credits</Link>
                <Link role="menuitem" href="/projects" onClick={() => setMenuOpen(false)}>My Projects</Link>
                {user ? <button role="menuitem" type="button" onClick={() => void signOut()}>Sign Out</button> : <button role="menuitem" type="button" onClick={() => void signIn()}>Mock Sign In</button>}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
