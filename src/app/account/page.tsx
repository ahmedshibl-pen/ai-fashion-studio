import type { Metadata } from "next";

import { AccountExperience } from "@/features/account/account-experience";

export const metadata: Metadata = {
  title: "Account — AI Fashion Studio",
  description: "Manage the local prototype profile, studio credits and payment history.",
};

export default function AccountPage() {
  return <AccountExperience />;
}
