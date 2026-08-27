import type { Metadata } from "next";

import { CheckoutExperience } from "@/features/checkout/checkout-experience";
import { getPublicGenerationStatus } from "@/server/ai/env";

export const metadata: Metadata = {
  title: "Credit Confirmation — AI Fashion Studio",
  description: "Confirm mock credits and begin the local campaign generation.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const projectId = typeof query.project === "string" ? query.project : "";
  return <CheckoutExperience projectId={projectId} generationStatus={getPublicGenerationStatus()} />;
}
