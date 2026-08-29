import { CAMERA_PRESET_BY_ID, isCameraPresetId } from "@/features/basic-studio/camera-presets";
import { getLightingPresetsForModel, isLightingPresetId } from "@/features/basic-studio/lighting-presets";
import { isStudioModelId } from "@/features/basic-studio/model-catalog";
import { getPosePresetsForModel, isPosePresetId } from "@/features/basic-studio/pose-presets";
import type {
  AuthService,
  BillingService,
  CreateProjectInput,
  CreditPackage,
  DeliveryService,
  GenerationRuntimeStatus,
  GenerationService,
  MockOutcome,
  MockPaymentRecord,
  MockProject,
  MockProjectStatus,
  MockUser,
  ProductAsset,
  ProductAssetService,
  ProjectService,
} from "@/types/mock-platform";
import {
  DEFAULT_PRODUCT_SPECIFICATION,
  FABRIC_BEHAVIORS,
  GARMENT_CATEGORIES,
  GARMENT_DIMENSION_FIELDS,
  GARMENT_FITS,
  GARMENT_SAMPLE_SIZES,
  type ProductSpecification,
} from "@/types/generation";

const STORE_KEY = "ai-fashion-studio:mock-platform:v1";
export const MOCK_PLATFORM_UPDATED_EVENT = "ai-fashion-studio:mock-platform-updated";
const DEFAULT_BALANCE = 240;
const DEFAULT_LATENCY = 180;
const AUTH_CODE = "246810";

type MockStore = {
  version: 1;
  user: MockUser | null;
  balance: number;
  projects: MockProject[];
  payments: MockPaymentRecord[];
};

export class MockServiceError extends Error {
  constructor(
    message: string,
    readonly code: "invalid-input" | "storage-full" | "not-found" | "payment-failed" | "insufficient-credits" | "expired-session",
  ) {
    super(message);
    this.name = "MockServiceError";
  }
}

const CREDIT_PACKAGES: readonly CreditPackage[] = [
  { id: "starter", name: "Starter Credits", credits: 100, price: "$18", description: "For two focused campaign generations." },
  { id: "campaign", name: "Campaign Pack", credits: 300, price: "$42", description: "Best for a complete launch and variations." },
  { id: "studio", name: "Studio Reserve", credits: 800, price: "$96", description: "A larger reserve for ongoing production." },
] as const;

const DEFAULT_USER: MockUser = {
  id: "user-ahmed-studio",
  name: "Ahmed Shibl",
  email: "ahmed@studio.example",
  initials: "AS",
};

const DEMO_PRODUCT: ProductAsset = {
  id: "asset-demo-product",
  fileName: "editorial-knit.png",
  mimeType: "image/png",
  size: 864_000,
  previewDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
};

const MALE_DEMO_SETUP = {
  modelId: "male-model-01",
  lightingPresetId: "clean-softbox",
  posePresetId: "male-relaxed-front",
  cameraPresetId: "male-upper-body-close-up",
} as const;

const FEMALE_DEMO_SETUP = {
  modelId: "female-model-01",
  lightingPresetId: "female-clean-softbox",
  posePresetId: "female-neutral-front",
  cameraPresetId: "female-high-angle-portrait",
} as const;

const DEMO_PROJECT_INPUTS: readonly {
  id: string;
  name: string;
  status: MockProjectStatus;
  setup: typeof MALE_DEMO_SETUP | typeof FEMALE_DEMO_SETUP;
  resultImagePath: string;
  updatedAt: string;
  generationStage?: number;
  approvedAt?: string;
}[] = [
  { id: "campaign-demo-draft", name: "Monochrome Knit Study", status: "draft", setup: MALE_DEMO_SETUP, resultImagePath: "/images/basic-studio/models/male-model-01/camera/upper-body-close-up.webp", updatedAt: "2026-08-25T00:42:00.000Z" },
  { id: "campaign-demo-payment", name: "Leather Essentials", status: "awaiting-payment", setup: FEMALE_DEMO_SETUP, resultImagePath: "/images/basic-studio/models/female-model-01/camera/high-angle-portrait.webp", updatedAt: "2026-08-24T22:18:00.000Z" },
  { id: "campaign-demo-queued", name: "Quiet Tailoring", status: "queued", setup: MALE_DEMO_SETUP, resultImagePath: "/images/basic-studio/models/male-model-01/camera/upper-body-close-up.webp", updatedAt: "2026-08-24T20:30:00.000Z" },
  { id: "campaign-demo-processing", name: "After Hours Denim", status: "processing", setup: FEMALE_DEMO_SETUP, resultImagePath: "/images/basic-studio/models/female-model-01/camera/high-angle-portrait.webp", updatedAt: "2026-08-24T19:05:00.000Z", generationStage: 2 },
  { id: "campaign-demo-completed", name: "Studio Uniform No. 02", status: "completed", setup: MALE_DEMO_SETUP, resultImagePath: "/images/basic-studio/models/male-model-01/camera/upper-body-close-up.webp", updatedAt: "2026-08-24T17:12:00.000Z", generationStage: 4 },
  { id: "campaign-demo-approved", name: "Editorial Foundations", status: "approved", setup: FEMALE_DEMO_SETUP, resultImagePath: "/images/basic-studio/models/female-model-01/camera/high-angle-portrait.webp", updatedAt: "2026-08-24T15:44:00.000Z", generationStage: 4, approvedAt: "2026-08-24T15:44:00.000Z" },
  { id: "campaign-demo-failed", name: "Shadow Line Capsule", status: "failed", setup: MALE_DEMO_SETUP, resultImagePath: "/images/basic-studio/models/male-model-01/camera/upper-body-close-up.webp", updatedAt: "2026-08-24T13:20:00.000Z", generationStage: 2 },
] as const;

const DEFAULT_PAYMENTS: readonly MockPaymentRecord[] = [
  { id: "payment-demo-generation", label: "Campaign generation", description: "Studio Uniform No. 02 · Version 01", credits: -40, price: "40 credits", status: "completed", createdAt: "2026-08-24T17:10:00.000Z" },
  { id: "payment-demo-pack", label: "Starter Credits", description: "Prototype credit package", credits: 100, price: "$18", status: "completed", createdAt: "2026-08-21T11:30:00.000Z" },
] as const;

function createDemoProjects(): MockProject[] {
  return DEMO_PROJECT_INPUTS.map((item, index) => ({
    id: item.id,
    draftId: `draft-demo-${index + 1}`,
    name: item.name,
    studioId: "basic-studio",
    product: DEMO_PRODUCT,
    productSpecification: DEFAULT_PRODUCT_SPECIFICATION,
    setup: item.setup,
    status: item.status,
    generationStage: item.generationStage ?? 0,
    version: 1,
    resultImagePath: item.resultImagePath,
    creditsCost: 40,
    adjustmentNote: "",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: item.updatedAt,
    approvedAt: item.approvedAt ?? null,
  }));
}

function delay(ms = DEFAULT_LATENCY) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function createId(prefix: string) {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProjectStatus(value: unknown): value is MockProjectStatus {
  return ["draft", "awaiting-payment", "queued", "processing", "completed", "failed", "approved", "delivered"].includes(String(value));
}

function validateProduct(value: unknown): ProductAsset | null {
  if (!isRecord(value)) return null;
  const mimeType = value.mimeType;
  if (mimeType !== "image/png" && mimeType !== "image/jpeg" && mimeType !== "image/webp") return null;
  if (typeof value.id !== "string" || typeof value.fileName !== "string" || typeof value.size !== "number") return null;
  if (typeof value.previewDataUrl !== "string" || !value.previewDataUrl.startsWith("data:image/")) return null;
  return { id: value.id, fileName: value.fileName, mimeType, size: value.size, previewDataUrl: value.previewDataUrl };
}

function validateProductSpecification(value: unknown): ProductSpecification {
  if (!isRecord(value)) return DEFAULT_PRODUCT_SPECIFICATION;
  const dimensions = isRecord(value.dimensions)
    ? Object.fromEntries(
        GARMENT_DIMENSION_FIELDS
          .map(({ key }) => [key, value.dimensions && (value.dimensions as Record<string, unknown>)[key]])
          .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] >= 10 && entry[1] <= 300),
      )
    : undefined;
  return {
    garmentCategory: GARMENT_CATEGORIES.includes(value.garmentCategory as ProductSpecification["garmentCategory"])
      ? value.garmentCategory as ProductSpecification["garmentCategory"]
      : DEFAULT_PRODUCT_SPECIFICATION.garmentCategory,
    sampleSize: GARMENT_SAMPLE_SIZES.includes(value.sampleSize as ProductSpecification["sampleSize"])
      ? value.sampleSize as ProductSpecification["sampleSize"]
      : DEFAULT_PRODUCT_SPECIFICATION.sampleSize,
    intendedFit: GARMENT_FITS.includes(value.intendedFit as ProductSpecification["intendedFit"])
      ? value.intendedFit as ProductSpecification["intendedFit"]
      : DEFAULT_PRODUCT_SPECIFICATION.intendedFit,
    fabricBehavior: FABRIC_BEHAVIORS.includes(value.fabricBehavior as ProductSpecification["fabricBehavior"])
      ? value.fabricBehavior as ProductSpecification["fabricBehavior"]
      : DEFAULT_PRODUCT_SPECIFICATION.fabricBehavior,
    dimensions: dimensions && Object.keys(dimensions).length > 0 ? dimensions : undefined,
  };
}

function validateProject(value: unknown): MockProject | null {
  if (!isRecord(value) || !isRecord(value.setup)) return null;
  const setup = value.setup;
  const product = validateProduct(value.product);
  const modelId = typeof setup.modelId === "string" && isStudioModelId(setup.modelId) ? setup.modelId : null;
  const lightingPresetId = isLightingPresetId(setup.lightingPresetId) && modelId && getLightingPresetsForModel(modelId).some((preset) => preset.id === setup.lightingPresetId)
    ? setup.lightingPresetId
    : null;
  const posePresetId = isPosePresetId(setup.posePresetId) && modelId && getPosePresetsForModel(modelId).some((preset) => preset.id === setup.posePresetId)
    ? setup.posePresetId
    : null;
  const cameraPresetId = isCameraPresetId(setup.cameraPresetId) && modelId && CAMERA_PRESET_BY_ID[setup.cameraPresetId].supportedModelIds.includes(modelId)
    ? setup.cameraPresetId
    : null;
  if (!product || !modelId || !lightingPresetId || !posePresetId || !cameraPresetId || !isProjectStatus(value.status)) return null;
  if (typeof value.id !== "string" || typeof value.draftId !== "string" || typeof value.name !== "string") return null;
  if (typeof value.createdAt !== "string" || typeof value.updatedAt !== "string" || typeof value.resultImagePath !== "string") return null;
  return {
    id: value.id,
    draftId: value.draftId,
    name: value.name,
    studioId: "basic-studio",
    product,
    productSpecification: validateProductSpecification(value.productSpecification),
    setup: { modelId, lightingPresetId, posePresetId, cameraPresetId },
    status: value.status,
    generationStage: typeof value.generationStage === "number" ? Math.max(0, Math.min(4, value.generationStage)) : 0,
    version: typeof value.version === "number" ? Math.max(1, value.version) : 1,
    resultImagePath: value.resultImagePath,
    generationAttempted: value.generationAttempted === true,
    generationResult: isRecord(value.generationResult) && (value.generationResult.provider === "mock" || value.generationResult.provider === "gemini" || value.generationResult.provider === "replicate")
      ? value.generationResult as MockProject["generationResult"]
      : undefined,
    generationError: isRecord(value.generationError) && typeof value.generationError.code === "string" && typeof value.generationError.message === "string"
      ? { code: value.generationError.code, message: value.generationError.message, retryable: value.generationError.retryable === true }
      : undefined,
    creditsCost: typeof value.creditsCost === "number" ? value.creditsCost : 40,
    adjustmentNote: typeof value.adjustmentNote === "string" ? value.adjustmentNote : "",
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    approvedAt: typeof value.approvedAt === "string" ? value.approvedAt : null,
  };
}

function validatePayment(value: unknown): MockPaymentRecord | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.label !== "string" || typeof value.description !== "string") return null;
  if (typeof value.credits !== "number" || typeof value.price !== "string" || typeof value.createdAt !== "string") return null;
  if (value.status !== "completed" && value.status !== "failed") return null;
  return { id: value.id, label: value.label, description: value.description, credits: value.credits, price: value.price, status: value.status, createdAt: value.createdAt };
}

function withDemoProjects(projects: MockProject[]) {
  const ids = new Set(projects.map((project) => project.id));
  return [...projects, ...createDemoProjects().filter((project) => !ids.has(project.id))];
}

function defaultStore(): MockStore {
  return { version: 1, user: null, balance: DEFAULT_BALANCE, projects: createDemoProjects(), payments: [...DEFAULT_PAYMENTS] };
}

function readStore(): MockStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return defaultStore();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaultStore();
    const user = isRecord(parsed.user) && typeof parsed.user.id === "string" && typeof parsed.user.name === "string" && typeof parsed.user.email === "string" && typeof parsed.user.initials === "string"
      ? { id: parsed.user.id, name: parsed.user.name, email: parsed.user.email, initials: parsed.user.initials }
      : null;
    const projects = Array.isArray(parsed.projects) ? parsed.projects.map(validateProject).filter((project): project is MockProject => project !== null) : [];
    const payments = Array.isArray(parsed.payments) ? parsed.payments.map(validatePayment).filter((payment): payment is MockPaymentRecord => payment !== null) : [...DEFAULT_PAYMENTS];
    return { version: 1, user, balance: typeof parsed.balance === "number" && parsed.balance >= 0 ? parsed.balance : DEFAULT_BALANCE, projects: withDemoProjects(projects), payments };
  } catch {
    return defaultStore();
  }
}

function writeStore(store: MockStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(MOCK_PLATFORM_UPDATED_EVENT));
  } catch {
    throw new MockServiceError("The local prototype store is full. Clear saved projects and try again.", "storage-full");
  }
}

export function clearMockPlatformStore() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORE_KEY);
  window.dispatchEvent(new Event(MOCK_PLATFORM_UPDATED_EVENT));
}

function updateStoredProject(projectId: string, update: (project: MockProject) => MockProject) {
  const store = readStore();
  const index = store.projects.findIndex((project) => project.id === projectId);
  if (index < 0) throw new MockServiceError("Project not found.", "not-found");
  const project = update(store.projects[index]);
  store.projects[index] = project;
  writeStore(store);
  return project;
}

async function imageToPreviewDataUrl(file: File) {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new MockServiceError("The product image could not be read.", "invalid-input"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new MockServiceError("The product image could not be decoded.", "invalid-input"));
    element.src = source;
  });
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new MockServiceError("The product preview could not be prepared.", "invalid-input");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.82);
}

export const mockAuthService: AuthService = {
  async getSession() {
    await delay(40);
    return readStore().user;
  },
  async signInWithGoogle() {
    await delay();
    const store = readStore();
    store.user = DEFAULT_USER;
    writeStore(store);
    return DEFAULT_USER;
  },
  async requestEmailCode(email) {
    await delay();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new MockServiceError("Enter a valid email address.", "invalid-input");
    return { draftToken: `draft-${btoa(email).slice(0, 12)}` };
  },
  async verifyEmailCode(email, code, draftToken) {
    await delay();
    if (!draftToken.startsWith("draft-") || code !== AUTH_CODE) throw new MockServiceError("Use the prototype code 246810.", "expired-session");
    const user = { ...DEFAULT_USER, email, name: email.split("@")[0].replace(/[._-]/g, " "), initials: email.slice(0, 2).toUpperCase() };
    const store = readStore();
    store.user = user;
    writeStore(store);
    return user;
  },
  async signOut() {
    await delay(80);
    const store = readStore();
    store.user = null;
    writeStore(store);
  },
};

export const mockProductAssetService: ProductAssetService = {
  async createLocalAsset(file) {
    const previewDataUrl = await imageToPreviewDataUrl(file);
    return { id: createId("asset"), fileName: file.name, mimeType: file.type as ProductAsset["mimeType"], size: file.size, previewDataUrl };
  },
};

export const mockProjectService: ProjectService = {
  async createDraft(input: CreateProjectInput) {
    await delay();
    const store = readStore();
    const now = new Date().toISOString();
    const existing = store.projects.find((project) => project.status === "draft" && project.product.id === input.product.id);
    const resultImagePath = CAMERA_PRESET_BY_ID[input.setup.cameraPresetId].imagePath;
    if (existing) {
      const updated = { ...existing, setup: input.setup, product: input.product, productSpecification: input.productSpecification, resultImagePath, generationAttempted: false, generationResult: undefined, generationError: undefined, updatedAt: now };
      store.projects[store.projects.indexOf(existing)] = updated;
      writeStore(store);
      return updated;
    }
    const project: MockProject = {
      id: createId("campaign"),
      draftId: createId("draft"),
      name: `${input.product.fileName.replace(/\.[^.]+$/, "")} Campaign`,
      studioId: "basic-studio",
      product: input.product,
      productSpecification: input.productSpecification,
      setup: input.setup,
      status: "draft",
      generationStage: 0,
      version: 1,
      resultImagePath,
      generationAttempted: false,
      creditsCost: 40,
      adjustmentNote: "",
      createdAt: now,
      updatedAt: now,
      approvedAt: null,
    };
    store.projects.unshift(project);
    writeStore(store);
    return project;
  },
  async getProject(projectId) {
    await delay(50);
    return readStore().projects.find((project) => project.id === projectId) ?? null;
  },
  async listProjects() {
    await delay(80);
    return readStore().projects;
  },
  async updateProject(projectId, patch) {
    await delay(80);
    return updateStoredProject(projectId, (project) => ({ ...project, ...patch, id: project.id, updatedAt: new Date().toISOString() }));
  },
  async duplicateProject(projectId) {
    await delay();
    const source = readStore().projects.find((project) => project.id === projectId);
    if (!source) throw new MockServiceError("Project not found.", "not-found");
    const now = new Date().toISOString();
    const duplicate = { ...source, id: createId("campaign"), draftId: createId("draft"), name: `${source.name} Copy`, status: "draft" as const, generationStage: 0, approvedAt: null, createdAt: now, updatedAt: now };
    const store = readStore();
    store.projects.unshift(duplicate);
    writeStore(store);
    return duplicate;
  },
};

export const mockBillingService: BillingService = {
  async getBalance() {
    await delay(40);
    return readStore().balance;
  },
  async getPackages() {
    await delay(40);
    return CREDIT_PACKAGES;
  },
  async getPaymentHistory() {
    await delay(60);
    return [...readStore().payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async purchaseCredits(packageId, outcome) {
    await delay(420);
    const pack = CREDIT_PACKAGES.find((item) => item.id === packageId);
    if (!pack) throw new MockServiceError("Choose a valid credit package.", "invalid-input");
    const store = readStore();
    const payment: MockPaymentRecord = {
      id: createId("payment"),
      label: pack.name,
      description: "Prototype credit package",
      credits: outcome === "success" ? pack.credits : 0,
      price: pack.price,
      status: outcome === "success" ? "completed" : "failed",
      createdAt: new Date().toISOString(),
    };
    store.payments.unshift(payment);
    if (outcome === "failure") {
      writeStore(store);
      throw new MockServiceError("Mock credit purchase failed. No credits were added.", "payment-failed");
    }
    store.balance += pack.credits;
    writeStore(store);
    return { balance: store.balance, payment };
  },
  async checkout(projectId, packageId, outcome: MockOutcome) {
    await delay(420);
    const store = readStore();
    const projectIndex = store.projects.findIndex((project) => project.id === projectId);
    if (projectIndex < 0) throw new MockServiceError("Project not found.", "not-found");
    if (outcome === "failure") {
      store.payments.unshift({ id: createId("payment"), label: "Campaign generation", description: store.projects[projectIndex].name, credits: 0, price: `${store.projects[projectIndex].creditsCost} credits`, status: "failed", createdAt: new Date().toISOString() });
      writeStore(store);
      throw new MockServiceError("Mock payment failed. Switch the prototype outcome to success and try again.", "payment-failed");
    }
    if (packageId !== "balance") {
      const pack = CREDIT_PACKAGES.find((item) => item.id === packageId);
      if (!pack) throw new MockServiceError("Choose a valid credit package.", "invalid-input");
      store.balance += pack.credits;
      store.payments.unshift({ id: createId("payment"), label: pack.name, description: "Prototype credit package", credits: pack.credits, price: pack.price, status: "completed", createdAt: new Date().toISOString() });
    }
    const project = store.projects[projectIndex];
    if (store.balance < project.creditsCost) throw new MockServiceError("There are not enough credits for this campaign.", "insufficient-credits");
    store.balance -= project.creditsCost;
    store.payments.unshift({ id: createId("payment"), label: "Campaign generation", description: project.name, credits: -project.creditsCost, price: `${project.creditsCost} credits`, status: "completed", createdAt: new Date().toISOString() });
    const updated = { ...project, status: "queued" as const, generationStage: 0, updatedAt: new Date().toISOString() };
    store.projects[projectIndex] = updated;
    writeStore(store);
    return { balance: store.balance, project: updated };
  },
};

export const mockGenerationService: GenerationService = {
  async start(projectId) {
    await delay();
    return updateStoredProject(projectId, (project) => ({ ...project, status: "queued", generationStage: 0, updatedAt: new Date().toISOString() }));
  },
  async setStatus(projectId, status: GenerationRuntimeStatus, stage = 0) {
    await delay(60);
    return updateStoredProject(projectId, (project) => ({ ...project, status, generationStage: status === "completed" ? 4 : Math.max(0, Math.min(4, stage)), updatedAt: new Date().toISOString() }));
  },
  async regenerate(projectId, adjustmentNote = "") {
    await delay();
    return updateStoredProject(projectId, (project) => ({ ...project, status: "queued", generationStage: 0, version: project.version + 1, adjustmentNote, approvedAt: null, updatedAt: new Date().toISOString() }));
  },
};

export const mockDeliveryService: DeliveryService = {
  async approve(projectId) {
    await delay();
    return updateStoredProject(projectId, (project) => ({ ...project, status: "approved", approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  },
  async prepareDelivery(projectId) {
    await delay(420);
    return updateStoredProject(projectId, (project) => ({ ...project, status: "delivered", updatedAt: new Date().toISOString() }));
  },
  async getDownloads(projectId) {
    const project = await mockProjectService.getProject(projectId);
    if (!project) throw new MockServiceError("Project not found.", "not-found");
    return [
      { label: "Download High Resolution", fileName: `${project.id}-high-resolution.webp`, href: project.resultImagePath },
      { label: "Download Web Version", fileName: `${project.id}-web.webp`, href: project.resultImagePath },
      { label: "Download All", fileName: `${project.id}-campaign.webp`, href: project.resultImagePath },
    ] as const;
  },
};
