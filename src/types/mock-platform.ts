import type { CameraPresetId } from "@/features/basic-studio/camera-presets";
import type { LightingPresetId } from "@/features/basic-studio/lighting-presets";
import type { StudioModelId } from "@/features/basic-studio/model-catalog";
import type { PosePresetId } from "@/features/basic-studio/pose-presets";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

export type ProductAsset = {
  id: string;
  fileName: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  size: number;
  previewDataUrl: string;
};

export type MockProjectStatus =
  | "draft"
  | "awaiting-payment"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "approved"
  | "delivered";

export type GenerationRuntimeStatus = "queued" | "processing" | "completed" | "failed";

export type ProjectSetup = {
  modelId: StudioModelId;
  lightingPresetId: LightingPresetId;
  posePresetId: PosePresetId;
  cameraPresetId: CameraPresetId;
};

export type MockProject = {
  id: string;
  draftId: string;
  name: string;
  studioId: "basic-studio";
  product: ProductAsset;
  setup: ProjectSetup;
  status: MockProjectStatus;
  generationStage: number;
  version: number;
  resultImagePath: string;
  creditsCost: number;
  adjustmentNote: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
};

export type CreditPackage = {
  id: "starter" | "campaign" | "studio";
  name: string;
  credits: number;
  price: string;
  description: string;
};

export type MockOutcome = "success" | "failure";

export type CreateProjectInput = {
  product: ProductAsset;
  setup: ProjectSetup;
};

export interface AuthService {
  getSession(): Promise<MockUser | null>;
  signInWithGoogle(): Promise<MockUser>;
  requestEmailCode(email: string): Promise<{ draftToken: string }>;
  verifyEmailCode(email: string, code: string, draftToken: string): Promise<MockUser>;
  signOut(): Promise<void>;
}

export interface ProductAssetService {
  createLocalAsset(file: File): Promise<ProductAsset>;
}

export interface ProjectService {
  createDraft(input: CreateProjectInput): Promise<MockProject>;
  getProject(projectId: string): Promise<MockProject | null>;
  listProjects(): Promise<MockProject[]>;
  updateProject(projectId: string, patch: Partial<MockProject>): Promise<MockProject>;
  duplicateProject(projectId: string): Promise<MockProject>;
}

export interface BillingService {
  getBalance(): Promise<number>;
  getPackages(): Promise<readonly CreditPackage[]>;
  checkout(projectId: string, packageId: CreditPackage["id"] | "balance", outcome: MockOutcome): Promise<{ balance: number; project: MockProject }>;
}

export interface GenerationService {
  start(projectId: string): Promise<MockProject>;
  setStatus(projectId: string, status: GenerationRuntimeStatus, stage?: number): Promise<MockProject>;
  regenerate(projectId: string, adjustmentNote?: string): Promise<MockProject>;
}

export interface DeliveryService {
  approve(projectId: string): Promise<MockProject>;
  prepareDelivery(projectId: string): Promise<MockProject>;
  getDownloads(projectId: string): Promise<readonly { label: string; fileName: string; href: string }[]>;
}
