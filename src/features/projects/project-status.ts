import type { StatusTone } from "@/components/ui";
import type { MockProjectStatus } from "@/types/mock-platform";

export const PROJECT_STATUS_LABELS: Record<MockProjectStatus, string> = {
  draft: "Draft",
  "awaiting-payment": "Awaiting payment",
  queued: "Queued",
  processing: "Processing",
  completed: "Ready for review",
  failed: "Failed",
  approved: "Approved",
  delivered: "Files ready",
};

export function projectStatusTone(status: MockProjectStatus): StatusTone {
  if (status === "failed") return "error";
  if (status === "completed" || status === "approved" || status === "delivered") return "success";
  if (status === "awaiting-payment") return "warning";
  if (status === "queued" || status === "processing") return "information";
  return "neutral";
}
