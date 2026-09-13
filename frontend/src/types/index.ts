export type UserRole = 'lender' | 'borrower' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
  lenderProfile?: LenderProfile;
  borrowerProfile?: BorrowerProfile;
  adminProfile?: AdminProfile;
}

export type RiskTolerancePreference = 'Conservative' | 'Moderate' | 'Balanced' | 'Growth' | 'Aggressive';

export type LenderEligibilityStatus =
  | 'PROFILE_INCOMPLETE'
  | 'KYC_PENDING'
  | 'BANK_DETAILS_PENDING'
  | 'UNDER_REVIEW'
  | 'ELIGIBLE'
  | 'REQUIRES_ACTION';

export interface BankAccountDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType?: 'Current' | 'Cash Credit' | 'Overdraft' | string;
  verificationStatus: 'Not Added' | 'Pending' | 'Verified' | 'Requires Action';
}

export interface ProfileDocumentItem {
  id: string;
  name: string;
  category: string;
  status: 'Not Uploaded' | 'Uploaded' | 'Pending Review' | 'Verified' | 'Rejected' | 'Requires Action';
  uploadedDate?: string;
  fileSize?: string;
}

export interface LenderProfile {
  mobile: string;
  profileStatus: 'INCOMPLETE' | 'UNDER_REVIEW' | 'COMPLETE';
  eligibilityStatus: LenderEligibilityStatus;
  profileCompletion: number; // 0 - 100 percentage
  fullName?: string;
  dob?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  pan?: string;
  aadhaarLast4?: string;
  kycStatus: 'Not Started' | 'Pending' | 'Verified' | 'Requires Action';
  bankAccount?: BankAccountDetails;
  occupation?: string;
  investorType?: 'Individual' | 'Professional Investor' | 'Institutional';
  annualIncomeRange?: string;
  sourceOfFunds?: string;
  experienceYears?: number;
  availableCapital: number;
  activeFinancing: number;
  totalExposure: number;
  preferredFinancingAmount?: number;
  preferredDownsideTolerance: number; // NOTE: Explicitly preferred threshold, not a loss guarantee or insurance
  preferredCategories: string[];
  preferredGeography?: string;
  preferredTenureMonths: number;
  preferredReturnRange: string;
  riskPreference: RiskTolerancePreference;
  documents?: ProfileDocumentItem[];
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  riskDisclosureAccepted?: boolean;
}

export type LegalEntityType = 'Sole Proprietorship' | 'Partnership' | 'LLP' | 'Private Limited' | 'Public Limited' | 'Other';

export type BorrowerVisibilityStatus = 'PRIVATE' | 'UNDER_VERIFICATION' | 'DISCOVERABLE' | 'REQUIRES_ACTION' | 'SUSPENDED';

export interface BorrowerProfile {
  authorizedPersonName: string;
  designation: string;
  mobile: string;
  email?: string;
  profileStatus: 'INCOMPLETE' | 'UNDER_REVIEW' | 'COMPLETE';
  verificationStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REQUIRES_ACTION';
  visibilityStatus: BorrowerVisibilityStatus;
  eligibilityStatus: 'PENDING' | 'ELIGIBLE' | 'NOT_ELIGIBLE';
  profileCompletion: number; // 0 - 100 percentage
  businessName: string;
  tradeName?: string;
  entityType: LegalEntityType;
  industry: string;
  category: string;
  yearEstablished: number;
  registeredAddress: string;
  operatingAddress?: string;
  city: string;
  state: string;
  cin: string;
  gstin: string;
  pan: string;
  udyamNumber?: string;
  annualRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  existingDebt: number;
  monthlyDebtObligation: number;
  receivableDays?: number;
  payableDays?: number;
  cashFlowInfo?: string;
  employeesCount: number;
  majorCustomers?: string;
  majorSuppliers?: string;
  productsServices?: string;
  keyProducts?: string;
  operatingRegions?: string;
  revenueSources?: string;
  businessModel?: string;
  requestedAmount?: number;
  purpose?: string;
  preferredTenure?: number | string;
  expectedRepaymentSource?: string;
  growthPlan?: string;
  useOfFunds?: string;
  bankAccount?: BankAccountDetails;
  documents?: ProfileDocumentItem[];
  healthScore: number;
  dataConsentAccepted?: boolean;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
}

export interface AdminProfile {
  department: string;
  permissions: string[];
  lastLogin: string;
}

export interface ScorePillarBreakdown {
  name: string;
  score: number;
  maxScore: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Weak';
  insights: string[];
}

export interface BusinessTrustHealthScore {
  overallScore: number; // 0 - 100
  status: 'Healthy' | 'Moderate' | 'Watch' | 'Critical';
  trend: 'Improving' | 'Stable' | 'Deteriorating';
  trendPoints: number; // e.g. +4 or -2
  lastUpdated: string;
  pillars: {
    businessVerification: ScorePillarBreakdown; // 20 pts
    financialStability: ScorePillarBreakdown;   // 20 pts
    cashFlowHealth: ScorePillarBreakdown;       // 20 pts
    repaymentCapacity: ScorePillarBreakdown;    // 20 pts
    operationalStability: ScorePillarBreakdown; // 10 pts
    transparency: ScorePillarBreakdown;         // 10 pts
  };
  historicalTrend: { month: string; score: number }[];
}

export type RiskSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface RiskItem {
  id: string;
  category: string;
  score: number; // 0 - 100
  severity: RiskSeverity;
  trend: 'Decreasing' | 'Stable' | 'Increasing';
  evidenceSignal: string;
  explanation: string;
  recommendedAction: string;
}

export interface DependencyAssessment {
  dependencyRiskScore: number; // 0 - 100
  severity: RiskSeverity;
  customerConcentration: {
    topCustomerName: string;
    topCustomerPercent: number;
    topThreePercent: number;
    customers: { name: string; percentage: number; tenureMonths: number; status: string }[];
  };
  supplierConcentration: {
    topSupplierName: string;
    topSupplierPercent: number;
    topThreePercent: number;
    suppliers: { name: string; percentage: number; reliability: string }[];
  };
  productConcentration: {
    topProductName: string;
    topProductPercent: number;
    products: { name: string; percentage: number; margin: string }[];
  };
  channelConcentration: {
    channelName: string;
    percentage: number;
  }[];
  geographicConcentration: {
    region: string;
    percentage: number;
  }[];
  aiExplanation: string;
  mitigationActions: string[];
}

export interface MonitoringEvent {
  id: string;
  date: string;
  metric: string;
  previousValue: string;
  currentValue: string;
  changePercent: number;
  severity: RiskSeverity;
  implication: string;
  recommendedAction: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
}

export interface BusinessDocument {
  id: string;
  name: string;
  category: 'Identity' | 'Business Registration' | 'GST' | 'Tax' | 'Financial' | 'Banking' | 'Supporting Documents';
  fileSize: string;
  uploadedDate: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Requires Action';
  verifiedBy?: string;
  notes?: string;
}

export interface FinancingOpportunity {
  id: string;
  businessName: string;
  legalEntity: string;
  industry: string;
  category: string;
  location: string;
  requestedAmount: number;
  tenureMonths: number;
  purpose: string;
  expectedReturnRate: number; // % p.a.
  healthScore: number;
  trustScore: number;
  riskLevel: RiskSeverity;
  revenueAnnual: number;
  monthlyGrowthRate: number; // %
  debtServiceCoverageRatio: number;
  dependencyRisk: RiskSeverity;
  monitoringStatus: 'Active' | 'Under Review' | 'Flagged';
  suggestedAction: 'Prime Match' | 'Selective Financing' | 'Additional Diligence';
  repaymentSource: string;
  growthPlanSummary: string;
  metrics: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    netMargin: number;
    receivableDays: number;
    payableDays: number;
    cashRunwayMonths: number;
  };
  monthlyPerformance: {
    month: string;
    revenue: number;
    expenses: number;
    cashFlow: number;
  }[];
}

export interface ActivePortfolioPosition {
  id: string;
  lenderId?: string;
  businessId: string;
  businessName: string;
  industry: string;
  financedAmount: number;
  preferredDownsideTolerance: number;
  expectedReturnRate: number;
  startDate: string;
  tenureMonths: number;
  remainingMonths: number;
  healthScore: number;
  riskLevel: RiskSeverity;
  status: 'Active' | 'Healthy' | 'Watch' | 'At Risk' | 'Completed';
  totalRepaid: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  nextReviewDate: string;
}

export interface PlatformAlert {
  id: string;
  title: string;
  businessName?: string;
  businessId?: string;
  message: string;
  category: 'Critical' | 'Warning' | 'Information';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface SimulationScenarioResult {
  scenarioName: 'Base Case' | 'Stress Case' | 'Optimistic Case';
  monthlyRevenue: number;
  monthlyExpenses: number;
  netCashFlow: number;
  debtServiceCoverageRatio: number;
  modelHealthScore: number;
  modelRiskScore: number;
  repaymentCapacityRating: 'Strong' | 'Adequate' | 'Strained' | 'Impaired';
  probabilityIndicator: string;
  keyDrivers: string[];
}

export interface ScenarioSimulationInput {
  revenueChangePercent: number;
  receivableDelayDays: number;
  primaryCustomerLoss: boolean;
  marginContractionPercent: number;
}
