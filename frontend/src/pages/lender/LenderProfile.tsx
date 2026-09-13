import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  CreditCard,
  Briefcase,
  TrendingUp,
  FileText,
  Sparkles,
  Check,
  Building2,
  ArrowRight,
  Clock,
  UploadCloud,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DownsideToleranceNotice } from '../../components/common/DownsideToleranceNotice';
import { formatINR } from '../../utils/formatters';
import { calculateLenderProfileCompletion } from '../../utils/profileCompletion';
import { LenderProfile } from '../../types';

export const LenderProfilePage: React.FC = () => {
  const { user, updateLenderProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSimulatingKyc, setIsSimulatingKyc] = useState<boolean>(false);
  const [isSimulatingBank, setIsSimulatingBank] = useState<boolean>(false);

  const lenderProfile: Partial<LenderProfile> = user?.lenderProfile || {};

  // Form state
  const [formData, setFormData] = useState<Partial<LenderProfile>>({
    fullName: lenderProfile.fullName || user?.name || '',
    mobile: lenderProfile.mobile || '',
    dob: lenderProfile.dob || '1988-06-15',
    address: lenderProfile.address || '',
    city: lenderProfile.city || '',
    state: lenderProfile.state || '',
    country: lenderProfile.country || 'India',
    pan: lenderProfile.pan || '',
    aadhaarLast4: lenderProfile.aadhaarLast4 || '',
    kycStatus: lenderProfile.kycStatus || 'Not Started',
    bankAccount: {
      accountHolderName: lenderProfile.bankAccount?.accountHolderName || user?.name || '',
      bankName: lenderProfile.bankAccount?.bankName || '',
      accountNumber: lenderProfile.bankAccount?.accountNumber || '',
      ifsc: lenderProfile.bankAccount?.ifsc || '',
      verificationStatus: lenderProfile.bankAccount?.verificationStatus || 'Not Added'
    },
    occupation: lenderProfile.occupation || 'Salaried Professional',
    annualIncomeRange: lenderProfile.annualIncomeRange || '₹15L - ₹25L',
    sourceOfFunds: lenderProfile.sourceOfFunds || 'Personal Savings / Business Profits',
    preferredFinancingAmount: lenderProfile.preferredFinancingAmount || 25000,
    preferredCategories: lenderProfile.preferredCategories || ['Precision Engineering', 'Agri-Tech', 'Textiles & Apparel'],
    preferredGeography: lenderProfile.preferredGeography || 'Pan-India',
    preferredTenureMonths: lenderProfile.preferredTenureMonths || 12,
    preferredReturnRange: lenderProfile.preferredReturnRange || '13% - 16% p.a.',
    riskPreference: lenderProfile.riskPreference || 'Balanced',
    preferredDownsideTolerance: lenderProfile.preferredDownsideTolerance || 50000,
    termsAccepted: lenderProfile.termsAccepted ?? true,
    privacyAccepted: lenderProfile.privacyAccepted ?? true,
    riskDisclosureAccepted: lenderProfile.riskDisclosureAccepted ?? true,
    documents: lenderProfile.documents || [
      { id: 'doc-pan', name: 'PAN Card Copy', category: 'Identity', status: 'Uploaded' },
      { id: 'doc-id', name: 'Aadhaar / Passport', category: 'Identity', status: 'Uploaded' },
      { id: 'doc-bank', name: 'Bank Statement / Cancelled Cheque', category: 'Banking', status: 'Uploaded' }
    ]
  });

  const availableCategories = [
    'Precision Engineering',
    'Agri-Tech',
    'Textiles & Apparel',
    'Pharmaceuticals',
    'Automotive Components',
    'Logistics & Warehousing',
    'Electronics Manufacturing',
    'Specialty Chemicals'
  ];

  const quickAmountPresets = [3000, 5000, 10000, 25000, 50000, 100000];

  const completion = calculateLenderProfileCompletion(formData);

  const handleToggleCategory = (cat: string) => {
    const current = formData.preferredCategories || [];
    if (current.includes(cat)) {
      setFormData({ ...formData, preferredCategories: current.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, preferredCategories: [...current, cat] });
    }
  };

  const handleSimulateKyc = () => {
    setIsSimulatingKyc(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        pan: prev.pan || 'AAAPS1234F',
        aadhaarLast4: prev.aadhaarLast4 || '8821',
        kycStatus: 'Verified'
      }));
      setIsSimulatingKyc(false);
    }, 1000);
  };

  const handleSimulateBankVerify = () => {
    setIsSimulatingBank(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        bankAccount: {
          accountHolderName: prev.bankAccount?.accountHolderName || prev.fullName || 'Verified Account Holder',
          bankName: prev.bankAccount?.bankName || 'HDFC Bank Ltd',
          accountNumber: prev.bankAccount?.accountNumber || '50100234981122',
          ifsc: prev.bankAccount?.ifsc || 'HDFC0000123',
          verificationStatus: 'Verified'
        }
      }));
      setIsSimulatingBank(false);
    }, 1000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = {
      ...formData,
      profileCompletion: completion.totalPercentage,
      eligibilityStatus: completion.eligibilityStatus,
      profileStatus: completion.statusBadge
    };
    updateLenderProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const tabs = [
    { id: 'personal', label: '1. Personal Info', icon: User, complete: !!(formData.fullName && formData.city && formData.state) },
    { id: 'kyc', label: '2. Identity & KYC', icon: ShieldCheck, complete: formData.kycStatus === 'Verified' },
    { id: 'bank', label: '3. Bank Account', icon: CreditCard, complete: formData.bankAccount?.verificationStatus === 'Verified' },
    { id: 'financial', label: '4. Financial Profile', icon: Briefcase, complete: !!(formData.occupation && formData.annualIncomeRange) },
    { id: 'preferences', label: '5. Lending Preferences', icon: Sliders, complete: !!formData.preferredFinancingAmount },
    { id: 'risk', label: '6. Risk & Downside', icon: TrendingUp, complete: !!(formData.preferredDownsideTolerance && formData.riskPreference) },
    { id: 'documents', label: '7. Documents', icon: FileText, complete: formData.documents?.some(d => d.status === 'Uploaded' || d.status === 'Verified') },
    { id: 'agreements', label: '8. Agreements', icon: FileCheck2, complete: !!(formData.termsAccepted && formData.privacyAccepted && formData.riskDisclosureAccepted) }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
          <User className="w-3.5 h-3.5" /> Lender Profile & Eligibility Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Complete Your Lender Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Complete the required profile information, verified KYC, and bank mandate to unlock financing participation on verified MSME opportunities.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">
            Profile saved and updated successfully. Your updated completion status is reflected across the CodeVest platform.
          </div>
        </div>
      )}

      {/* Completion & Eligibility Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lender Verification Status
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                completion.eligibilityStatus === 'ELIGIBLE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : completion.eligibilityStatus === 'KYC_PENDING'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {completion.eligibilityStatus.replace(/_/g, ' ')}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                completion.statusBadge === 'COMPLETE'
                  ? 'bg-emerald-600 text-white'
                  : completion.statusBadge === 'UNDER_REVIEW'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}>
                {completion.statusBadge}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {completion.totalPercentage}% Profile Completed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {completion.eligibilityStatus === 'ELIGIBLE'
                ? 'Your profile meets all platform requirements. You are fully eligible to participate in financing.'
                : 'Complete your profile to unlock lender eligibility and financing participation.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completion.totalPercentage >= 85
                  ? 'bg-emerald-500'
                  : completion.totalPercentage >= 50
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${completion.totalPercentage}%` }}
            />
          </div>
        </div>

        {/* Step checklist chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-2.5 rounded-xl text-left border transition text-xs flex items-center justify-between cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-50/50 font-semibold text-blue-900'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-white'
              }`}
            >
              <span className="truncate">{tab.label}</span>
              {tab.complete ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Downside Tolerance Notice banner */}
      <DownsideToleranceNotice tolerance={formData.preferredDownsideTolerance || 50000} />

      {/* Tabs Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Navigation Header */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/60 p-2 gap-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.complete && <Check className="w-3 h-3 text-emerald-600 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Legal identity details as recorded in government identification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full legal name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Flat / House No., Street, Area"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai, Bengaluru, Pune"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra, Karnataka, Gujarat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('kyc'); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to KYC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY & KYC */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Identity & KYC Verification</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mandatory statutory identity checks for marketplace lending compliance.
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                  formData.kycStatus === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  Status: {formData.kycStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Permanent Account Number (PAN) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.pan}
                    onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Required for tax reporting and individual verification.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aadhaar Last 4 Digits / Government ID *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.aadhaarLast4}
                    onChange={e => setFormData({ ...formData, aadhaarLast4: e.target.value.replace(/\D/g, '') })}
                    placeholder="8821"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Only the last 4 digits are recorded under data security standards.
                  </span>
                </div>
              </div>

              {/* Simulation Box */}
              <div className="p-5 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-950">Verification Sandbox</span>
                </div>
                <p className="text-xs text-slate-600">
                  You can simulate instant CKYC / UIDAI credential verification to activate your lender profile right away.
                </p>
                <button
                  type="button"
                  disabled={isSimulatingKyc}
                  onClick={handleSimulateKyc}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSimulatingKyc ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying with CKYC Registry...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{formData.kycStatus === 'Verified' ? 'Re-Verify KYC' : 'Simulate KYC Verification'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('bank'); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Bank</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BANK ACCOUNT */}
          {activeTab === 'bank' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bank Account Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your primary bank account for facility disbursements and monthly repayment inflows.
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                  formData.bankAccount?.verificationStatus === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  Bank Status: {formData.bankAccount?.verificationStatus || 'Not Added'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount?.accountHolderName || ''}
                    onChange={e => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount!, accountHolderName: e.target.value }
                    })}
                    placeholder="As registered in bank account"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount?.bankName || ''}
                    onChange={e => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount!, bankName: e.target.value }
                    })}
                    placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount?.accountNumber || ''}
                    onChange={e => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount!, accountNumber: e.target.value }
                    })}
                    placeholder="Account number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.bankAccount?.ifsc || ''}
                    onChange={e => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount!, ifsc: e.target.value.toUpperCase() }
                    })}
                    placeholder="HDFC0000123"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Bank Verification Simulation */}
              <div className="p-5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">Bank Account Penny-Drop Verification</span>
                </div>
                <p className="text-xs text-slate-600">
                  Simulate an automated penny-drop verification to validate account holder match and enable seamless settlement.
                </p>
                <button
                  type="button"
                  disabled={isSimulatingBank}
                  onClick={handleSimulateBankVerify}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSimulatingBank ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Initiating Penny Drop...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{formData.bankAccount?.verificationStatus === 'Verified' ? 'Re-Verify Account' : 'Simulate Penny-Drop Verification'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('kyc')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('financial'); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Financial Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL PROFILE */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Financial Profile & Source of Funds</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  General financial profile information. There is no artificial high-income barrier to lend on CodeVest.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Occupation *
                  </label>
                  <select
                    value={formData.occupation}
                    onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Salaried Professional">Salaried Professional</option>
                    <option value="Business Owner / Founder">Business Owner / Founder</option>
                    <option value="Self-Employed Professional (CA/Doctor/Lawyer)">Self-Employed Professional</option>
                    <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                    <option value="Retired / Private Investor">Retired / Private Investor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Income Range *
                  </label>
                  <select
                    value={formData.annualIncomeRange}
                    onChange={e => setFormData({ ...formData, annualIncomeRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Up to ₹5 Lakhs">Up to ₹5 Lakhs</option>
                    <option value="₹5 Lakhs - ₹10 Lakhs">₹5 Lakhs - ₹10 Lakhs</option>
                    <option value="₹10 Lakhs - ₹25 Lakhs">₹10 Lakhs - ₹25 Lakhs</option>
                    <option value="₹25 Lakhs - ₹50 Lakhs">₹25 Lakhs - ₹50 Lakhs</option>
                    <option value="₹50 Lakhs+">₹50 Lakhs+</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source of Funds for Lending *
                  </label>
                  <select
                    value={formData.sourceOfFunds}
                    onChange={e => setFormData({ ...formData, sourceOfFunds: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Personal Savings / Salary">Personal Savings / Salary</option>
                    <option value="Business Profits & Retained Earnings">Business Profits & Retained Earnings</option>
                    <option value="Investment Returns & Dividends">Investment Returns & Dividends</option>
                    <option value="Family Office / Other Capital">Family Office / Other Capital</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('preferences'); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: LENDING PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Lending Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set your comfortable ticket sizes, target return range, and sector focus.
                </p>
              </div>

              {/* Preferred Lending Amount with Quick Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Preferred Facility Financing Amount (INR) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickAmountPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredFinancingAmount: preset })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        formData.preferredFinancingAmount === preset
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 block mb-1">Or enter custom amount:</span>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={formData.preferredFinancingAmount || ''}
                    onChange={e => setFormData({ ...formData, preferredFinancingAmount: Number(e.target.value) })}
                    className="w-full max-w-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Preferred Sectors */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Preferred Business Categories / Industries
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => {
                    const selected = (formData.preferredCategories || []).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleToggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          selected
                            ? 'border-blue-600 bg-blue-600 text-white font-bold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}{cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tenure & Geography */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Tenure Range
                  </label>
                  <select
                    value={formData.preferredTenureMonths}
                    onChange={e => setFormData({ ...formData, preferredTenureMonths: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value={3}>3 Months (Ultra Short Term)</option>
                    <option value={6}>6 Months (Short Term Working Capital)</option>
                    <option value={9}>9 Months</option>
                    <option value={12}>12 Months (Standard Term)</option>
                    <option value={18}>18 Months</option>
                    <option value={24}>24 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Annualized Return Range
                  </label>
                  <select
                    value={formData.preferredReturnRange}
                    onChange={e => setFormData({ ...formData, preferredReturnRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="12% - 14% p.a.">12% - 14% p.a. (Prime Grade A)</option>
                    <option value="14% - 16% p.a.">14% - 16% p.a. (Balanced MSME)</option>
                    <option value="16% - 18% p.a.">16% - 18% p.a. (Growth Yield)</option>
                    <option value="18%+ p.a.">18%+ p.a. (High Yield Opportunities)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('financial')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('risk'); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Risk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: RISK & DOWNSIDE PREFERENCES */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Risk Profile & Preferred Downside Tolerance</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your risk archetype and set your individual decision-making risk threshold.
                </p>
              </div>

              {/* Risk Archetype Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Select Your Risk Appetite
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['Conservative', 'Moderate', 'Balanced', 'Growth', 'Aggressive'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, riskPreference: p })}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                        formData.riskPreference === p
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Downside Tolerance Slider */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Preferred Downside Tolerance (INR) *
                  </label>
                  <span className="text-sm font-black text-blue-600">
                    {formatINR(formData.preferredDownsideTolerance || 50000)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={500000}
                  step={10000}
                  value={formData.preferredDownsideTolerance || 50000}
                  onChange={e => setFormData({ ...formData, preferredDownsideTolerance: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />

                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    Mandatory Regulatory Non-Insurance Notice
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Preferred downside tolerance is an individual preference setting for decision-making and portfolio monitoring. It is not an insurance policy, sovereign guarantee, or loss protection mechanism. CodeVest does not guarantee returns or cap losses.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('preferences')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('documents'); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Identity & Financial Documents</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supporting documents for offline regulatory audits and CKYC archiving.
                </p>
              </div>

              <div className="space-y-3">
                {formData.documents?.map(doc => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Category: {doc.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : doc.status === 'Uploaded'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.documents || []).map(d =>
                            d.id === doc.id ? { ...d, status: 'Uploaded' as const } : d
                          );
                          setFormData({ ...formData, documents: updated });
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload Copy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('risk')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('agreements'); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Agreements</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: AGREEMENTS & DISCLOSURES */}
          {activeTab === 'agreements' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Agreements & Regulatory Consent</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your legal consents and platform terms.
                </p>
              </div>

              <div className="space-y-3.5">
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Terms and Conditions Acceptance:</span> I confirm that I am legally eligible to participate in peer-to-business MSME financing and agree to the platform operating guidelines.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={e => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Privacy & Data Handling:</span> I consent to the processing of my identity and banking information for statutory KYC verification and financial transactions.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.riskDisclosureAccepted}
                    onChange={e => setFormData({ ...formData, riskDisclosureAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Risk Disclosure & Capital at Risk:</span> I acknowledge that financing involves risk of delay or capital loss. Preferred downside tolerance is an individual preference setting, not a guarantee or insurance.
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Finalize & Update Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
