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
  MockProject,
  MockProjectStatus,
  MockUser,
  ProductAsset,
  ProductAssetService,
  ProjectService,
} from "@/types/mock-platform";

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
};

export class MockServiceError extends Error {
  constructor(
    message: string,
    readonly code: "invalid-input" | "not-found" | "payment-failed" | "insufficient-credits" | "expired-session",
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
    setup: { modelId, lightingPresetId, posePresetId, cameraPresetId },
    status: value.status,
    generationStage: typeof value.generationStage === "number" ? Math.max(0, Math.min(4, value.generationStage)) : 0,
    version: typeof value.version === "number" ? Math.max(1, value.version) : 1,
    resultImagePath: value.resultImagePath,
    creditsCost: typeof value.creditsCost === "number" ? value.creditsCost : 40,
    adjustmentNote: typeof value.adjustmentNote === "string" ? value.adjustmentNote : "",
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    approvedAt: typeof value.approvedAt === "string" ? value.approvedAt : null,
  };
}

function defaultStore(): MockStore {
  return { version: 1, user: null, balance: DEFAULT_BALANCE, projects: [] };
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
    return { version: 1, user, balance: typeof parsed.balance === "number" && parsed.balance >= 0 ? parsed.balance : DEFAULT_BALANCE, projects };
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
    throw new MockServiceError("The local prototype store is full. Remove a large product image and try again.", "invalid-input");
  }
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
      const updated = { ...existing, setup: input.setup, product: input.product, resultImagePath, updatedAt: now };
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
      setup: input.setup,
      status: "draft",
      generationStage: 0,
      version: 1,
      resultImagePath,
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
  async checkout(projectId, packageId, outcome: MockOutcome) {
    await delay(420);
    if (outcome === "failure") throw new MockServiceError("Mock payment failed. Switch the prototype outcome to success and try again.", "payment-failed");
    const store = readStore();
    const projectIndex = store.projects.findIndex((project) => project.id === projectId);
    if (projectIndex < 0) throw new MockServiceError("Project not found.", "not-found");
    if (packageId !== "balance") {
      const pack = CREDIT_PACKAGES.find((item) => item.id === packageId);
      if (!pack) throw new MockServiceError("Choose a valid credit package.", "invalid-input");
      store.balance += pack.credits;
    }
    const project = store.projects[projectIndex];
    if (store.balance < project.creditsCost) throw new MockServiceError("There are not enough credits for this campaign.", "insufficient-credits");
    store.balance -= project.creditsCost;
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
