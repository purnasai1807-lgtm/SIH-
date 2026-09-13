import { LenderProfile, BorrowerProfile, LenderEligibilityStatus, BorrowerVisibilityStatus } from '../types';

export interface SectionCompletion {
  id: string;
  name: string;
  weight: number;
  isComplete: boolean;
  score: number;
  details?: string;
}

export function calculateLenderProfileCompletion(profile?: Partial<LenderProfile>): {
  totalPercentage: number;
  sections: SectionCompletion[];
  eligibilityStatus: LenderEligibilityStatus;
  statusBadge: 'INCOMPLETE' | 'UNDER_REVIEW' | 'COMPLETE';
} {
  if (!profile) {
    return {
      totalPercentage: 0,
      sections: [],
      eligibilityStatus: 'PROFILE_INCOMPLETE',
      statusBadge: 'INCOMPLETE'
    };
  }

  // 1. Personal Information (15%)
  const hasPersonal = !!(
    profile.fullName &&
    profile.mobile &&
    profile.dob &&
    profile.city &&
    profile.state
  );
  const personalScore = hasPersonal ? 15 : profile.fullName && profile.mobile ? 8 : 0;

  // 2. Identity / KYC (15%)
  const hasKYC = !!(profile.pan && profile.aadhaarLast4);
  const kycScore = profile.kycStatus === 'Verified' ? 15 : hasKYC ? 10 : 0;

  // 3. Bank Account (15%)
  const hasBank = !!(
    profile.bankAccount?.accountNumber &&
    profile.bankAccount?.ifsc &&
    profile.bankAccount?.bankName
  );
  const bankScore = profile.bankAccount?.verificationStatus === 'Verified' ? 15 : hasBank ? 8 : 0;

  // 4. Financial Profile (15%)
  const hasFinancial = !!(
    profile.occupation &&
    profile.annualIncomeRange &&
    profile.sourceOfFunds
  );
  const financialScore = hasFinancial ? 15 : profile.annualIncomeRange ? 8 : 0;

  // 5. Lending Preferences (15%)
  const hasPreferences = !!(
    profile.preferredFinancingAmount &&
    (profile.preferredCategories && profile.preferredCategories.length > 0) &&
    profile.preferredGeography
  );
  const preferencesScore = hasPreferences ? 15 : profile.preferredCategories?.length ? 8 : 0;

  // 6. Risk Preference (15%)
  const hasRisk = !!(
    profile.riskPreference &&
    profile.preferredDownsideTolerance !== undefined &&
    profile.preferredDownsideTolerance > 0
  );
  const riskScore = hasRisk ? 15 : profile.riskPreference ? 8 : 0;

  // 7. Documents (5%)
  const hasDocs = !!(profile.documents && profile.documents.length > 0 && profile.documents.some(d => d.status === 'Uploaded' || d.status === 'Verified'));
  const docScore = hasDocs ? 5 : 0;

  // 8. Agreements & Disclosures (5%)
  const hasAgreements = !!(profile.termsAccepted && profile.privacyAccepted && profile.riskDisclosureAccepted);
  const agreementScore = hasAgreements ? 5 : 0;

  const totalPercentage = Math.min(100, Math.round(
    personalScore + kycScore + bankScore + financialScore + preferencesScore + riskScore + docScore + agreementScore
  ));

  const sections: SectionCompletion[] = [
    { id: 'personal', name: 'Personal Information', weight: 15, isComplete: hasPersonal, score: personalScore },
    { id: 'kyc', name: 'Identity & KYC Verification', weight: 15, isComplete: profile.kycStatus === 'Verified', score: kycScore },
    { id: 'bank', name: 'Bank Account Details', weight: 15, isComplete: hasBank, score: bankScore },
    { id: 'financial', name: 'Financial Profile', weight: 15, isComplete: hasFinancial, score: financialScore },
    { id: 'preferences', name: 'Lending Preferences', weight: 15, isComplete: hasPreferences, score: preferencesScore },
    { id: 'risk', name: 'Risk & Downside Preferences', weight: 15, isComplete: hasRisk, score: riskScore },
    { id: 'documents', name: 'Identity & Financial Documents', weight: 5, isComplete: hasDocs, score: docScore },
    { id: 'agreements', name: 'Agreements & Disclosures', weight: 5, isComplete: hasAgreements, score: agreementScore }
  ];

  let eligibilityStatus: LenderEligibilityStatus = 'PROFILE_INCOMPLETE';
  if (totalPercentage < 60) {
    eligibilityStatus = 'PROFILE_INCOMPLETE';
  } else if (profile.kycStatus !== 'Verified') {
    eligibilityStatus = 'KYC_PENDING';
  } else if (!hasBank || profile.bankAccount?.verificationStatus !== 'Verified') {
    eligibilityStatus = 'BANK_DETAILS_PENDING';
  } else if (totalPercentage >= 85 && profile.kycStatus === 'Verified') {
    eligibilityStatus = 'ELIGIBLE';
  } else {
    eligibilityStatus = 'UNDER_REVIEW';
  }

  const statusBadge: 'INCOMPLETE' | 'UNDER_REVIEW' | 'COMPLETE' =
    eligibilityStatus === 'ELIGIBLE' ? 'COMPLETE' : totalPercentage >= 70 ? 'UNDER_REVIEW' : 'INCOMPLETE';

  return {
    totalPercentage,
    sections,
    eligibilityStatus,
    statusBadge
  };
}

export function calculateBorrowerProfileCompletion(profile?: Partial<BorrowerProfile>): {
  totalPercentage: number;
  sections: SectionCompletion[];
  visibilityStatus: BorrowerVisibilityStatus;
  statusBadge: 'INCOMPLETE' | 'UNDER_REVIEW' | 'COMPLETE';
  verificationStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REQUIRES_ACTION';
} {
  if (!profile) {
    return {
      totalPercentage: 0,
      sections: [],
      visibilityStatus: 'PRIVATE',
      statusBadge: 'INCOMPLETE',
      verificationStatus: 'NOT_STARTED'
    };
  }

  // 1. Authorized Person (10%)
  const hasAuth = !!(profile.authorizedPersonName && profile.designation && profile.mobile);
  const authScore = hasAuth ? 10 : profile.authorizedPersonName ? 5 : 0;

  // 2. Business Identity (15%)
  const hasIdentity = !!(
    profile.businessName &&
    profile.entityType &&
    profile.industry &&
    profile.yearEstablished &&
    profile.registeredAddress &&
    profile.city &&
    profile.state
  );
  const identityScore = hasIdentity ? 15 : profile.businessName ? 7 : 0;

  // 3. Registration & Legal (15%)
  const hasLegal = !!(profile.pan && profile.gstin);
  const legalScore = profile.verificationStatus === 'VERIFIED' ? 15 : hasLegal ? 10 : 0;

  // 4. Financial Information (15%)
  const hasFinancial = !!(
    profile.annualRevenue &&
    profile.monthlyRevenue &&
    profile.monthlyExpenses &&
    profile.existingDebt !== undefined
  );
  const financialScore = hasFinancial ? 15 : profile.annualRevenue ? 8 : 0;

  // 5. Banking Information (10%)
  const hasBank = !!(
    profile.bankAccount?.accountNumber &&
    profile.bankAccount?.ifsc &&
    profile.bankAccount?.bankName
  );
  const bankScore = profile.bankAccount?.verificationStatus === 'Verified' ? 10 : hasBank ? 5 : 0;

  // 6. Business Operations (10%)
  const hasOps = !!(
    profile.employeesCount &&
    profile.majorCustomers &&
    profile.majorSuppliers &&
    profile.revenueSources
  );
  const opsScore = hasOps ? 10 : profile.employeesCount ? 5 : 0;

  // 7. Financing Requirements (10%)
  const hasFinancing = !!(
    profile.requestedAmount &&
    profile.purpose &&
    profile.preferredTenure &&
    profile.expectedRepaymentSource
  );
  const financingScore = hasFinancing ? 10 : profile.requestedAmount ? 5 : 0;

  // 8. Documents (5%)
  const hasDocs = !!(profile.documents && profile.documents.length > 0 && profile.documents.some(d => d.status === 'Uploaded' || d.status === 'Verified'));
  const docScore = hasDocs ? 5 : 0;

  // 9. Verification (5%)
  const verScore = profile.verificationStatus === 'VERIFIED' ? 5 : profile.verificationStatus === 'PENDING' ? 3 : 0;

  // 10. Consent & Agreements (5%)
  const hasConsent = !!(profile.termsAccepted && profile.privacyAccepted && profile.dataConsentAccepted);
  const consentScore = hasConsent ? 5 : 0;

  const totalPercentage = Math.min(100, Math.round(
    authScore + identityScore + legalScore + financialScore + bankScore + opsScore + financingScore + docScore + verScore + consentScore
  ));

  const sections: SectionCompletion[] = [
    { id: 'authorized', name: 'Authorized Person Information', weight: 10, isComplete: hasAuth, score: authScore },
    { id: 'identity', name: 'Business Identity & Registration', weight: 15, isComplete: hasIdentity, score: identityScore },
    { id: 'legal', name: 'Statutory Registrations (PAN/GST/CIN)', weight: 15, isComplete: hasLegal, score: legalScore },
    { id: 'financial', name: 'Financial Profiles & Metrics', weight: 15, isComplete: hasFinancial, score: financialScore },
    { id: 'bank', name: 'Bank Accounts & Cash Flow Feeds', weight: 10, isComplete: hasBank, score: bankScore },
    { id: 'operations', name: 'Operational & Counterparty Profile', weight: 10, isComplete: hasOps, score: opsScore },
    { id: 'requirements', name: 'Financing Facility Requirements', weight: 10, isComplete: hasFinancing, score: financingScore },
    { id: 'documents', name: 'Document Center', weight: 5, isComplete: hasDocs, score: docScore },
    { id: 'verification', name: 'Audit & Telemetry Verification', weight: 5, isComplete: profile.verificationStatus === 'VERIFIED', score: verScore },
    { id: 'consent', name: 'Regulatory Consent & Disclosures', weight: 5, isComplete: hasConsent, score: consentScore }
  ];

  let verificationStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REQUIRES_ACTION' = profile.verificationStatus || 'NOT_STARTED';
  if (verificationStatus === 'NOT_STARTED' && totalPercentage >= 50) {
    verificationStatus = 'PENDING';
  }

  let visibilityStatus: BorrowerVisibilityStatus = 'PRIVATE';
  if (verificationStatus === 'VERIFIED' && totalPercentage >= 80) {
    visibilityStatus = 'DISCOVERABLE';
  } else if (verificationStatus === 'PENDING' || totalPercentage >= 50) {
    visibilityStatus = 'UNDER_VERIFICATION';
  } else if (verificationStatus === 'REQUIRES_ACTION') {
    visibilityStatus = 'REQUIRES_ACTION';
  } else {
    visibilityStatus = 'PRIVATE';
  }

  const statusBadge: 'INCOMPLETE' | 'UNDER_REVIEW' | 'COMPLETE' =
    visibilityStatus === 'DISCOVERABLE' ? 'COMPLETE' : totalPercentage >= 60 ? 'UNDER_REVIEW' : 'INCOMPLETE';

  return {
    totalPercentage,
    sections,
    visibilityStatus,
    statusBadge,
    verificationStatus
  };
}
