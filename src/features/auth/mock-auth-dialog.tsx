"use client";

import { useState } from "react";

import { Button, Dialog, StatusMessage } from "@/components/ui";
import { MockServiceError, mockAuthService } from "@/lib/mock-platform";
import type { MockUser } from "@/types/mock-platform";

import styles from "./mock-auth-dialog.module.css";

export function MockAuthDialog({
  open,
  onClose,
  onAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: MockUser) => void;
}) {
  const [mode, setMode] = useState<"choose" | "email" | "code">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [draftToken, setDraftToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof MockServiceError ? caught.message : "The mocked sign-in could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = () => run(async () => {
    const user = await mockAuthService.signInWithGoogle();
    onAuthenticated(user);
  });

  const requestCode = () => run(async () => {
    const result = await mockAuthService.requestEmailCode(email);
    setDraftToken(result.draftToken);
    setMode("code");
  });

  const verifyCode = () => run(async () => {
    const user = await mockAuthService.verifyEmailCode(email, code, draftToken);
    onAuthenticated(user);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Save the campaign draft"
      description="Sign in to keep your private product and creative setup together. This is a local prototype only."
    >
      <div className={styles.authBody}>
        <div className={styles.draftNotice}>
          <span aria-hidden="true">✓</span>
          <div><strong>Your setup is preserved</strong><p>After sign-in you will continue directly to credit confirmation.</p></div>
        </div>

        {mode === "choose" ? (
          <div className={styles.methodStack}>
            <Button type="button" onClick={googleSignIn} disabled={busy}>Continue with Google <span aria-hidden="true">→</span></Button>
            <button className={styles.emailChoice} type="button" onClick={() => setMode("email")}>Continue with email</button>
          </div>
        ) : null}

        {mode === "email" ? (
          <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void requestCode(); }}>
            <label htmlFor="mock-sign-in-email">Email address</label>
            <input id="mock-sign-in-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@brand.com" autoComplete="email" required />
            <div className={styles.formActions}>
              <Button type="button" variant="quiet" onClick={() => setMode("choose")}>Back</Button>
              <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send one-time code"}</Button>
            </div>
          </form>
        ) : null}

        {mode === "code" ? (
          <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void verifyCode(); }}>
            <div className={styles.prototypeCode}><span>Prototype code</span><strong>246810</strong></div>
            <label htmlFor="mock-sign-in-code">One-time code sent to {email}</label>
            <input id="mock-sign-in-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" required />
            <div className={styles.formActions}>
              <Button type="button" variant="quiet" onClick={() => setMode("email")}>Back</Button>
              <Button type="submit" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Verify & continue"}</Button>
            </div>
          </form>
        ) : null}

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <p className={styles.disclaimer}>No account is created and no data leaves this browser.</p>
      </div>
    </Dialog>
  );
}
