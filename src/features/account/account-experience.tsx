"use client";

import { useCallback, useEffect, useState } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { Button, Dialog, RadioCard, StatusBadge, StatusMessage } from "@/components/ui";
import {
  MOCK_PLATFORM_UPDATED_EVENT,
  MockServiceError,
  mockAuthService,
  mockBillingService,
} from "@/lib/mock-platform";
import type { CreditPackage, MockOutcome, MockPaymentRecord, MockUser } from "@/types/mock-platform";

import styles from "./account-experience.module.css";

function formatPaymentDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function AccountExperience() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [balance, setBalance] = useState(240);
  const [packages, setPackages] = useState<readonly CreditPackage[]>([]);
  const [payments, setPayments] = useState<MockPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage["id"]>("campaign");
  const [outcome, setOutcome] = useState<MockOutcome>("success");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "information"; text: string } | null>(null);

  const refreshAccount = useCallback(() => {
    void Promise.all([
      mockAuthService.getSession(),
      mockBillingService.getBalance(),
      mockBillingService.getPackages(),
      mockBillingService.getPaymentHistory(),
    ]).then(([nextUser, nextBalance, nextPackages, nextPayments]) => {
      setUser(nextUser);
      setBalance(nextBalance);
      setPackages(nextPackages);
      setPayments(nextPayments);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refreshAccount();
    window.addEventListener(MOCK_PLATFORM_UPDATED_EVENT, refreshAccount);
    return () => window.removeEventListener(MOCK_PLATFORM_UPDATED_EVENT, refreshAccount);
  }, [refreshAccount]);

  const signIn = async () => {
    setWorking(true);
    setMessage(null);
    await mockAuthService.signInWithGoogle();
    refreshAccount();
    setMessage({ tone: "success", text: "Mock studio profile restored in this browser." });
    setWorking(false);
  };

  const signOut = async () => {
    setWorking(true);
    await mockAuthService.signOut();
    refreshAccount();
    setMessage({ tone: "information", text: "Signed out locally. Projects and credits remain in this browser." });
    setWorking(false);
  };

  const purchaseCredits = async () => {
    setWorking(true);
    setMessage(null);
    try {
      const result = await mockBillingService.purchaseCredits(selectedPackage, outcome);
      setBalance(result.balance);
      setPayments(await mockBillingService.getPaymentHistory());
      setBuyOpen(false);
      setMessage({ tone: "success", text: `${result.payment.credits} mock credits added. No real payment was made.` });
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof MockServiceError ? caught.message : "The mock credit purchase could not be completed." });
    } finally {
      setWorking(false);
    }
  };

  const openCreditDialog = () => {
    setMessage(null);
    setOutcome("success");
    setBuyOpen(true);
  };

  const selected = packages.find((pack) => pack.id === selectedPackage);

  return (
    <div className={styles.page}>
      <AppHeader active="account" />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div><p className={styles.eyebrow}>Studio account / Local prototype</p><h1>Account & Credits</h1><p>Manage the mock identity, production balance and local payment record used across this prototype.</p></div>
          <StatusBadge tone={user ? "success" : "neutral"}>{loading ? "Loading" : user ? "Mock authenticated" : "Signed out"}</StatusBadge>
        </header>

        {message ? <StatusMessage tone={message.tone}>{message.text}</StatusMessage> : null}

        <div className={styles.accountGrid}>
          <section className={styles.profileCard} aria-labelledby="profile-title">
            <div className={styles.profileTopline}><p className={styles.eyebrow}>Profile</p><span>{user?.initials ?? "—"}</span></div>
            <h2 id="profile-title">{user?.name ?? "Studio guest"}</h2>
            <dl>
              <div><dt>Brand</dt><dd>AI Fashion Studio</dd></div>
              <div><dt>Email</dt><dd>{user?.email ?? "Sign in to attach a mock email"}</dd></div>
              <div><dt>Workspace</dt><dd>Private browser-local studio</dd></div>
            </dl>
            <div className={styles.profileActions}>
              {user ? <Button type="button" variant="secondary" onClick={() => void signOut()} disabled={working}>Sign Out</Button> : <Button type="button" onClick={() => void signIn()} disabled={working}>{working ? "Restoring…" : "Continue with Mock Google"}</Button>}
            </div>
          </section>

          <section className={styles.balanceCard} aria-labelledby="balance-title">
            <div><p className={styles.eyebrow}>Available balance</p><h2 id="balance-title"><span aria-hidden="true">✦</span> {loading ? "—" : balance}</h2><p>Studio credits</p></div>
            <p>Credits are used only by mocked campaign generations and never trigger a real transaction.</p>
            <Button type="button" onClick={openCreditDialog}>Buy Credits</Button>
          </section>

          <section className={styles.historyCard} aria-labelledby="history-title">
            <header><div><p className={styles.eyebrow}>Mock ledger</p><h2 id="history-title">Payment history</h2></div><span>{payments.length} records</span></header>
            <div className={styles.paymentList}>
              {payments.map((payment) => (
                <article key={payment.id}>
                  <div><StatusBadge tone={payment.status === "completed" ? "success" : "error"}>{payment.status}</StatusBadge><span>{formatPaymentDate(payment.createdAt)}</span></div>
                  <div><strong>{payment.label}</strong><p>{payment.description}</p></div>
                  <div className={payment.status === "completed" && payment.credits > 0 ? styles.creditPositive : styles.creditNegative}><strong>{payment.status === "failed" ? "0 credits" : `${payment.credits > 0 ? "+" : ""}${payment.credits} credits`}</strong><span>{payment.price}</span></div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.securityCard} aria-labelledby="security-title">
            <p className={styles.eyebrow}>Security</p><h2 id="security-title">Integration placeholder</h2><p>Real identity, session management and payment security are intentionally not connected in this frontend prototype.</p>
            <ul><li><span aria-hidden="true">✓</span> No passwords stored</li><li><span aria-hidden="true">✓</span> No payment details collected</li><li><span aria-hidden="true">✓</span> Browser-local projects only</li></ul>
          </section>
        </div>
      </main>

      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} title="Add mock studio credits" description="Choose a prototype package. No card details or real payment gateway are used." footer={<><Button type="button" variant="secondary" onClick={() => setBuyOpen(false)}>Cancel</Button><Button type="button" onClick={() => void purchaseCredits()} disabled={working || !selected}>{working ? "Confirming…" : `Add ${selected?.credits ?? 0} Credits`}</Button></>}>
        <div className={styles.packageList}>
          {packages.map((pack) => <RadioCard name="account-credit-package" value={pack.id} checked={selectedPackage === pack.id} onChange={(value) => setSelectedPackage(value as CreditPackage["id"])} title={`${pack.name} · ${pack.price}`} description={pack.description} metadata={`${pack.credits} credits`} key={pack.id} />)}
        </div>
        {process.env.NODE_ENV === "development" ? <fieldset className={styles.prototypeControls}><legend>Prototype outcome</legend><label><input type="radio" name="account-outcome" checked={outcome === "success"} onChange={() => setOutcome("success")} /> Success</label><label><input type="radio" name="account-outcome" checked={outcome === "failure"} onChange={() => setOutcome("failure")} /> Failure</label></fieldset> : null}
        {message?.tone === "error" ? <StatusMessage tone="error">{message.text}</StatusMessage> : null}
      </Dialog>
    </div>
  );
}
