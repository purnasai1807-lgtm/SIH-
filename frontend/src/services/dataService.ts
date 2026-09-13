import {
  ActivePortfolioPosition,
  BusinessDocument,
  BusinessTrustHealthScore,
  DependencyAssessment,
  FinancingOpportunity,
  MonitoringEvent,
  PlatformAlert,
  RiskItem,
  User,
} from '../types';
import { apiRequest } from './apiClient';

export interface BusinessRecord {
  id: string;
  name: string;
  legalEntity: string;
  industry: string;
  category: string;
  location: string;
  city: string;
  state: string;
  gstin: string;
  cin: string;
  pan: string;
  yearEstablished: number;
  employeesCount: number;
  annualRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  existingDebt: number;
  monthlyDebtObligation: number;
  healthScore: number;
  verificationStatus: string;
  visibilityStatus: string;
  profileStatus: string;
  profileCompletion: number;
  requestedAmount?: number;
  ownerUserId: string;
  ownerName: string;
  createdAt: string;
}

type ApiOpportunity = {
  id: number;
  business_id: number;
  amount_requested: number;
  purpose?: string | null;
  status: string;
  created_at: string;
  business_name?: string;
  industry?: string;
  region?: string;
  trust_health_score?: number | null;
  verification_status?: string;
};

type ApiLoan = {
  id: number;
  opportunity_id: number;
  lender_id: number;
  business_id: number;
  amount_lent: number;
  downside_tolerance: number;
  status: string;
  funded_at: string;
};

type ApiAlert = {
  id: number;
  business_id: number;
  severity: string;
  category: string;
  cause: string;
  description: string;
  trend?: string | null;
  status: string;
  created_at: string;
};

const toRiskSeverity = (value: string): 'Low' | 'Moderate' | 'High' | 'Critical' => {
  const normalized = value.toLowerCase();
  if (normalized === 'critical') return 'Critical';
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Moderate';
};

function mapOpportunity(item: ApiOpportunity): FinancingOpportunity {
  const score = item.trust_health_score ?? 0;
  return {
    id: String(item.id),
    businessName: item.business_name ?? `Business #${item.business_id}`,
    legalEntity: '',
    industry: item.industry ?? '',
    category: '',
    location: item.region ?? '',
    requestedAmount: item.amount_requested,
    tenureMonths: 0,
    purpose: item.purpose ?? '',
    expectedReturnRate: 0,
    healthScore: score,
    trustScore: score,
    riskLevel: score >= 75 ? 'Low' : score >= 50 ? 'Moderate' : score >= 25 ? 'High' : 'Critical',
    revenueAnnual: 0,
    monthlyGrowthRate: 0,
    debtServiceCoverageRatio: 0,
    dependencyRisk: 'Moderate',
    monitoringStatus: 'Active',
    suggestedAction: score >= 75 ? 'Prime Match' : 'Additional Diligence',
    repaymentSource: '',
    growthPlanSummary: '',
    metrics: {
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      netMargin: 0,
      receivableDays: 0,
      payableDays: 0,
      cashRunwayMonths: 0,
    },
    monthlyPerformance: [],
  };
}

class DataService {
  private opportunities: FinancingOpportunity[] = [];
  private positions: ActivePortfolioPosition[] = [];
  private alerts: PlatformAlert[] = [];
  private documents: BusinessDocument[] = [];

  async fetchOpportunities(): Promise<FinancingOpportunity[]> {
    const response = await apiRequest<ApiOpportunity[]>('/lender/opportunities');
    this.opportunities = response.map(mapOpportunity);
    return this.opportunities;
  }

  getOpportunitiesSync(): FinancingOpportunity[] {
    return this.opportunities;
  }

  async fetchOpportunity(id: string): Promise<FinancingOpportunity | undefined> {
    const response = await apiRequest<ApiOpportunity>(`/lender/opportunities/${id}`);
    const opportunity = mapOpportunity(response);
    this.opportunities = this.opportunities.map((item) => item.id === id ? opportunity : item);
    return opportunity;
  }

  getOpportunityByIdSync(id: string): FinancingOpportunity | undefined {
    return this.opportunities.find((item) => item.id === id);
  }

  async fetchPortfolio(): Promise<ActivePortfolioPosition[]> {
    const response = await apiRequest<ApiLoan[]>('/lender/portfolio');
    this.positions = response.map((item) => ({
      id: String(item.id),
      lenderId: String(item.lender_id),
      businessId: String(item.business_id),
      businessName: `Business #${item.business_id}`,
      industry: '',
      financedAmount: item.amount_lent,
      preferredDownsideTolerance: item.downside_tolerance,
      expectedReturnRate: 0,
      startDate: item.funded_at,
      tenureMonths: 0,
      remainingMonths: 0,
      healthScore: 0,
      riskLevel: 'Moderate',
      status: item.status === 'active' ? 'Active' : 'Completed',
      totalRepaid: 0,
      nextPaymentDate: '',
      nextPaymentAmount: 0,
      nextReviewDate: '',
    }));
    return this.positions;
  }

  getActivePositions(_lenderId?: string): ActivePortfolioPosition[] {
    return this.positions;
  }

  async fetchAlerts(role: 'lender' | 'admin' = 'lender'): Promise<PlatformAlert[]> {
    const response = await apiRequest<ApiAlert[]>(`/${role}/alerts`);
    this.alerts = response.map((item) => ({
      id: String(item.id),
      title: item.category,
      businessName: `Business #${item.business_id}`,
      businessId: String(item.business_id),
      message: item.description,
      category: item.severity.toLowerCase() === 'critical' ? 'Critical' : item.severity.toLowerCase() === 'warning' || item.severity.toLowerCase() === 'high' ? 'Warning' : 'Information',
      timestamp: item.created_at,
      isRead: item.status !== 'active',
    }));
    return this.alerts;
  }

  getAlerts(): PlatformAlert[] {
    return this.alerts;
  }

  getMonitoringAlerts(): PlatformAlert[] {
    return this.alerts;
  }

  markAlertAsRead(id: string): void {
    this.alerts = this.alerts.map((alert) => alert.id === id ? { ...alert, isRead: true } : alert);
  }

  resolveAlert(id: string): void {
    this.markAlertAsRead(id);
  }

  getFinancingRequests(): FinancingOpportunity[] {
    return this.opportunities;
  }

  getFinancingRequestById(id: string): FinancingOpportunity | undefined {
    return this.getOpportunityByIdSync(id);
  }

  addFinancingRequest(_request: FinancingOpportunity): void {
    throw new Error('Financing requests must be created through the backend API.');
  }

  getBusinesses(): BusinessRecord[] {
    return [];
  }

  getBusinessById(_id: string): BusinessRecord | undefined {
    return undefined;
  }

  getBusinessByOwnerUserId(_userId: string): BusinessRecord | undefined {
    return undefined;
  }

  saveBusiness(_business: BusinessRecord): void {
    throw new Error('Businesses must be created through the backend API.');
  }

  updateBusinessVerification(_businessId: string, _status: string): void {
    throw new Error('Verification must be updated through the backend API.');
  }

  getPortfolioPositions(_lenderId?: string): ActivePortfolioPosition[] {
    return this.positions;
  }

  addPortfolioPosition(_position: ActivePortfolioPosition): void {
    throw new Error('Loans must be created through the backend API.');
  }

  getDocuments(_businessId?: string): BusinessDocument[] {
    return this.documents;
  }

  addDocument(_businessId: string, _document: BusinessDocument): void {
    throw new Error('Documents must be uploaded through the backend API.');
  }

  getDependencyAssessment(_businessId?: string): DependencyAssessment | undefined {
    return undefined;
  }

  addAlert(_alert: PlatformAlert): void {
    throw new Error('Alerts are generated by the backend monitoring service.');
  }

  setHealthScore(_businessId: string, _score: BusinessTrustHealthScore): void {
    throw new Error('Health scores are calculated by the backend.');
  }

  async fetchBusinessHealth(): Promise<BusinessTrustHealthScore> {
    const response = await apiRequest<{ score: number; computed_at: string; explanation: string[] }>('/borrower/business-health');
    const score = response.score;
    const pillar = (name: string, value: number) => ({ name, score: value, maxScore: value, status: value >= 75 ? 'Excellent' as const : value >= 50 ? 'Good' as const : value >= 25 ? 'Fair' as const : 'Weak' as const, insights: [] });
    return {
      overallScore: score,
      status: score >= 75 ? 'Healthy' : score >= 50 ? 'Moderate' : score >= 25 ? 'Watch' : 'Critical',
      trend: 'Stable',
      trendPoints: 0,
      lastUpdated: response.computed_at,
      pillars: {
        businessVerification: pillar('Business verification', score),
        financialStability: pillar('Financial stability', score),
        cashFlowHealth: pillar('Cash flow health', score),
        repaymentCapacity: pillar('Repayment capacity', score),
        operationalStability: pillar('Operational stability', score),
        transparency: pillar('Transparency', score),
      },
      historicalTrend: [],
    };
  }

  getBusinessTrustScoreSync(_businessId?: string): BusinessTrustHealthScore | undefined {
    return undefined;
  }

  async fetchDependencyAssessment(): Promise<DependencyAssessment> {
    const response = await apiRequest<{ concentration_index: number; warnings: Array<{ entity_name: string; share_pct: number; trend: string; explanation: string }> }>('/borrower/dependencies');
    const warnings = response.warnings.map((item) => ({ name: item.entity_name, percentage: item.share_pct * 100, tenureMonths: 0, status: item.trend }));
    return {
      dependencyRiskScore: response.concentration_index * 100,
      severity: response.concentration_index > 0.5 ? 'High' : response.concentration_index > 0.35 ? 'Moderate' : 'Low',
      customerConcentration: { topCustomerName: warnings[0]?.name ?? '', topCustomerPercent: warnings[0]?.percentage ?? 0, topThreePercent: warnings.reduce((sum, item) => sum + item.percentage, 0), customers: warnings },
      supplierConcentration: { topSupplierName: '', topSupplierPercent: 0, topThreePercent: 0, suppliers: [] },
      productConcentration: { topProductName: '', topProductPercent: 0, products: [] },
      channelConcentration: [],
      geographicConcentration: [],
      aiExplanation: response.warnings.map((item) => item.explanation).join(' '),
      mitigationActions: [],
    };
  }

  async addFinancingCommitment(position: { opportunityId: string; amount: number; preferredDownsideTolerance: number; businessName?: string; industry?: string; expectedReturnRate?: number; tenureMonths?: number }): Promise<ApiLoan> {
    return apiRequest<ApiLoan>('/lender/lend', {
      method: 'POST',
      body: JSON.stringify({
        opportunity_id: Number(position.opportunityId),
        amount_lent: position.amount,
        downside_tolerance: position.preferredDownsideTolerance,
      }),
    });
  }

  getHealthScore(_businessId?: string): BusinessTrustHealthScore | undefined {
    return undefined;
  }

  getRiskAssessment(_businessId?: string): RiskItem[] {
    return [];
  }

  getRiskItemsSync(_businessId?: string): RiskItem[] {
    return [];
  }

  getMonitoringEvents(_businessId?: string): MonitoringEvent[] {
    return [];
  }

  getDependencyAssessmentSync(_businessId?: string): DependencyAssessment | undefined {
    return undefined;
  }

  getUsers(): User[] {
    return [];
  }

  getUserById(_id: string): User | undefined {
    return undefined;
  }
}

export const dataService = new DataService();
