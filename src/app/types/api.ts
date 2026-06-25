export type UserRole = 'patient' | 'radiologist' | 'admin';

export interface ApiErrorPayload {
  detail?: string;
  message?: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
}

export interface MessageResponse {
  message: string;
}

export interface ScopeStatusResponse {
  scope: string;
  status: string;
}

export type MedicalDocumentTypeApi =
  | 'ordonnance'
  | 'analyse'
  | 'imagerie'
  | 'rapport'
  | 'certificat'
  | 'autre';

export interface MedicalDocumentApi {
  id: string;
  name: string;
  type: MedicalDocumentTypeApi;
  date: string;
  size?: string | null;
  sizeBytes?: number | null;
  doctor?: string | null;
  pathology?: string | null;
  notes?: string | null;
  aiAnalyzed: boolean;
  fromScan: boolean;
  folderId?: string | null;
  shareToken?: string | null;
  fileUrl?: string | null;
  imageDataUrl?: string | null;
  reportContent?: string | null;
}

export interface DocumentFolderApi {
  id: string;
  name: string;
  description?: string | null;
  shareToken?: string | null;
  sharedAt?: string | null;
  createdAt: string;
  documentIds: string[];
}

export interface ShareCreateResponseApi {
  token: string;
  expiresAt: string;
  urlPath: string;
}

export interface SharedFolderPayloadApi {
  id: string;
  name: string;
  description?: string | null;
  documents: MedicalDocumentApi[];
}

export interface SharedLabInfoApi {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  rpps: string;
  siret: string;
  logoDataUrl: string;
  logoUrl?: string | null;
}

export type DicomReportStatusApi =
  | 'none'
  | 'generating'
  | 'ai_generated'
  | 'in_review'
  | 'finalized';

export interface DicomFileApi {
  id: string;
  name: string;
  sizeBytes?: number | null;
  modality?: string | null;
  uploadDate: string;
}

export interface DicomFolderApi {
  id: string;
  patientName: string;
  patientId?: string | null;
  pathology?: string | null;
  modality?: string | null;
  reportContent?: string | null;
  reportStatus: DicomReportStatusApi;
  shareToken?: string | null;
  pacsImported: boolean;
  pacsStudyUID?: string | null;
  finalizedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  files: DicomFileApi[];
}

export interface DicomFolderCreatePayloadApi {
  patientName: string;
  patientId?: string;
  pathology?: string;
  modality?: string;
  pacsImported?: boolean;
  pacsStudyUID?: string;
  initialFiles?: { name: string; sizeBytes: number; modality: string }[];
  reportContent?: string;
}

export interface DicomReportGenerateResponseApi {
  status: 'generating';
  folderId: string;
  jobId: string;
}

export interface RadiologistLabContextApi {
  lab: SharedLabInfoApi;
  profile: { name: string; title: string; specialty: string };
}

export interface PacsServerApi {
  id: string;
  name: string;
  host: string;
  port: number;
  aeTitle: string;
  callingAeTitle: string;
  protocol: 'DICOM' | 'DICOMweb';
  webUrl?: string | null;
  tls: boolean;
  active: boolean;
  connectionStatus: 'connected' | 'error' | 'unknown';
  lastConnected?: string | null;
  createdAt: string;
}

export interface PacsStudyApi {
  studyUID: string;
  patientName: string;
  patientId: string;
  patientBirthDate: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  modality: string;
  seriesCount: number;
  imagesCount: number;
  accessionNumber: string;
  referringPhysician: string;
  institutionName: string;
  bodyPart: string;
  status: 'available' | 'archived';
  hasReport: boolean;
  reportContent?: string | null;
}

export interface AsyncJobApi {
  jobId: string;
  status: string;
  progress: number;
  type: string;
  resultData?: { createdFolderIds?: string[]; folderId?: string | null } | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface SharedReportApi {
  patientName: string;
  patientId: string;
  pathology: string;
  modality: string;
  content: string;
  finalizedAt: string;
  radiologistName: string;
  radiologistTitle: string;
  radiologistSpecialty: string;
  lab: SharedLabInfoApi;
}

export interface SharedLinkPublicResponseApi {
  token: string;
  type: 'folder' | 'document' | 'report';
  label: string;
  createdAt: string;
  expiresAt: string;
  folder?: SharedFolderPayloadApi;
  document?: MedicalDocumentApi;
  report?: SharedReportApi;
}

export type SharedLinkResponse = SharedLinkPublicResponseApi;

export interface ScanFindingApi {
  severity: 'critical' | 'important' | 'moderate' | 'minor';
  category: string;
  title: string;
  description: string;
  location?: string | null;
  measurements?: { size?: string | null; dimension?: string | null; volume?: string | null } | null;
  classification?: string | null;
  characteristics?: string[] | null;
}

export interface ScanRecommendationApi {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timeframe?: string | null;
  action?: string | null;
}

export interface ScanTechnicalDetailsApi {
  modality?: string | null;
  bodyPart?: string | null;
  slices?: number | null;
  contrast?: boolean | null;
  acquisitionDate?: string | null;
}

export interface ScanAnalyzeResponseApi {
  type: string;
  examType?: string | null;
  anatomicalRegion?: string | null;
  confidence: number;
  findings: ScanFindingApi[];
  normalFindings?: string[] | null;
  recommendations: ScanRecommendationApi[];
  technicalDetails?: ScanTechnicalDetailsApi | null;
  disclaimer: string;
  suggestedName: string;
  suggestedPathology?: string | null;
  /** Present when `POST /api/scan/analyze-multipart` persisted a patient document server-side. */
  documentId?: string | null;
}

export interface ScanQuotaResponseApi {
  planId: string;
  maxScans: number;
  scansUsed: number;
  remaining: number;
  aiQuota: number;
  aiUsed: number;
}

export interface RadiologistStorageQuotaApi {
  usedGb: number;
  allocatedGb: number;
  unlimited: boolean;
}

export interface JobStatusResponse {
  jobId: string;
  status: string;
}

export interface AdminStatsApi {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  patients: number;
  radiologists: number;
  admins: number;
  totalStorageUsedGb: number;
  pendingGdprRequests: number;
  estimatedMonthlyRevenue: number;
  planDistribution: { planId: string; userCount: number; name: string }[];
}

export interface AdminUserRowApi {
  id: string;
  name: string;
  email: string;
  role: string;
  planId: string;
  status: string;
  storageUsedGb: number;
  storageAllocatedGb: number;
  createdAt: string;
  lastActiveAt: string;
}

export interface AdminPlanApi {
  id: string;
  name: string;
  price: number;
  storageGb: number;
  maxScans: number;
  aiQuota: number;
  features: string[];
  active: boolean;
  userCount: number;
}

export interface AdminStorageSummaryApi {
  totalUsedGb: number;
  totalAllocatedGb: number;
  userCount: number;
}

export interface AdminStorageUserApi {
  userId: string;
  name: string;
  email: string;
  role: string;
  planId: string;
  usedGb: number;
  allocatedGb: number;
}

export interface AdminStorageApi {
  summary: AdminStorageSummaryApi;
  users: AdminStorageUserApi[];
}

export interface AdminGdprRequestApi {
  id: string;
  userId?: string | null;
  userName?: string | null;
  type: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminComplianceApi {
  items: { label: string; ok: boolean }[];
  compliantCount: number;
  totalCount: number;
}
