// Re-export types with explicit naming to avoid conflicts

// Common base types - core API structures
export type {
  BaseComponentProps,
  BaseEntity,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  FilterOptions,
  SortOptions,
  PaginationOptions,
  QueryOptions,
  FormState,
  ListState,
  Permission,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./common";

// Entity types - main business objects
export type {
  User,
  Company,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UserInvitation,
  CompanyUser,
} from "./entities";

// Asset management types with prefixes to avoid conflicts
export type {
  Company as AssetCompany,
  User as AssetUser,
  Asset as AssetEntity,
  AssetCategory,
  Location as AssetLocation,
  Vendor,
  AssetMovement,
  MaintenanceType,
  WorkOrder,
  PartUsed,
  AuditLog,
  AssetFilters as AssetManagementFilters,
  WorkOrderFilters,
  ComplianceReport,
  DepreciationReport,
  IndonesianTaxReport,
  ISO27001Asset,
  ISO14001Asset,
  DashboardMetrics,
  AssetDepreciation,
} from "./asset-management";

// Service types - API operation types
export type {
  InviteUserData,
  AcceptInvitationData,
  VerifyInvitationResponse,
  AssetCreateData,
  AssetUpdateData,
  AssetFilters,
  CompanyCreateData,
  CompanyUpdateData,
  CompanyFilters,
  UserCreateData,
  UserUpdateData,
  UserFilters,
  ServiceConfig,
} from "./services";

// API types - legacy and file upload types
export type {
  FileUploadOptions,
  UploadResponse,
  LegacyLoginResponse,
  LegacyUserProfile,
  SimpleAsset,
  SimpleCompany,
  CreateAssetRequest,
  CreateCompanyRequest,
} from "./api";

// Security types
export * from "./security";
