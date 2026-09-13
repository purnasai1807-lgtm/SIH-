import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Save,
  Eye,
  EyeOff,
  Lock,
  Globe2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Check,
  CreditCard,
  Briefcase,
  Layers,
  FileCheck2,
  DollarSign,
  Clock,
  User,
  Building,
  FileBadge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';
import { calculateBorrowerProfileCompletion } from '../../utils/profileCompletion';
import { BorrowerProfile, BusinessDocument } from '../../types';

export const BorrowerProfilePage: React.FC = () => {
  const { user, updateBorrowerProfile } = useAuth();
  const profile = user?.borrowerProfile;

  // 10 Tabs navigation
  const [activeTab, setActiveTab] = useState<string>('authorized');
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSimulatingVerification, setIsSimulatingVerification] = useState(false);
  const [isSimulatingBank, setIsSimulatingBank] = useState(false);

  // Form State initialized from user's profile
  const [formData, setFormData] = useState<BorrowerProfile>({
    authorizedPersonName: profile?.authorizedPersonName || user?.name || '',
    designation: profile?.designation || 'Managing Director',
    mobile: profile?.mobile || '',
    email: profile?.email || user?.email || '',
    businessName: profile?.businessName || '',
    tradeName: profile?.tradeName || profile?.businessName || '',
    entityType: profile?.entityType || 'Private Limited',
    industry: profile?.industry || 'Manufacturing',
    category: profile?.category || 'Precision Engineering & Components',
    yearEstablished: profile?.yearEstablished || 2018,
    registeredAddress: profile?.registeredAddress || '',
    operatingAddress: profile?.operatingAddress || profile?.registeredAddress || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pan: profile?.pan || '',
    gstin: profile?.gstin || '',
    cin: profile?.cin || '',
    udyamNumber: profile?.udyamNumber || '',
    annualRevenue: profile?.annualRevenue || 12000000,
    monthlyRevenue: profile?.monthlyRevenue || 1000000,
    monthlyExpenses: profile?.monthlyExpenses || 750000,
    existingDebt: profile?.existingDebt || 1500000,
    monthlyDebtObligation: profile?.monthlyDebtObligation || 65000,
    bankAccount: {
      accountHolderName: profile?.bankAccount?.accountHolderName || profile?.businessName || '',
      bankName: profile?.bankAccount?.bankName || '',
      accountNumber: profile?.bankAccount?.accountNumber || '',
      ifsc: profile?.bankAccount?.ifsc || '',
      accountType: profile?.bankAccount?.accountType || 'Current',
      verificationStatus: profile?.bankAccount?.verificationStatus || 'Not Added'
    },
    businessModel: profile?.businessModel || 'B2B',
    keyProducts: profile?.keyProducts || 'High-precision CNC machined aerospace & automotive components',
    employeesCount: profile?.employeesCount || 35,
    majorCustomers: profile?.majorCustomers || 'Tata Motors, Bharat Forge, Mahindra Heavy Industries',
    majorSuppliers: profile?.majorSuppliers || 'Jindal Steel, Hindalco Industries, local certified alloy vendors',
    revenueSources: profile?.revenueSources || 'Direct domestic supply contracts (75%), Export OEM supply (25%)',
    requestedAmount: profile?.requestedAmount || 2500000,
    purpose: profile?.purpose || 'Working capital facility for raw material procurement and order expansion',
    preferredTenure: profile?.preferredTenure || '12 Months',
    expectedRepaymentSource: profile?.expectedRepaymentSource || 'Monthly customer receivables and invoiced milestones',
    verificationStatus: profile?.verificationStatus || 'NOT_STARTED',
    visibilityStatus: profile?.visibilityStatus || 'PRIVATE',
    profileStatus: profile?.profileStatus || 'INCOMPLETE',
    profileCompletion: profile?.profileCompletion || 20,
    healthScore: profile?.healthScore || 85,
    termsAccepted: profile?.termsAccepted ?? true,
    privacyAccepted: profile?.privacyAccepted ?? true,
    dataConsentAccepted: profile?.dataConsentAccepted ?? true,
    documents: profile?.documents || [
      { id: 'bdoc-pan', name: 'Business PAN Card Copy', category: 'Statutory', status: 'Uploaded' },
      { id: 'bdoc-gst', name: 'GST Registration Certificate (GST REG-06)', category: 'Statutory', status: 'Uploaded' },
      { id: 'bdoc-bank', name: 'Last 12 Months Bank Statements (AA XML / PDF)', category: 'Banking', status: 'Uploaded' },
      { id: 'bdoc-audit', name: 'Audited Financials / Last 2 Years ITR', category: 'Financial', status: 'Uploaded' },
      { id: 'bdoc-auth-id', name: 'Identity Proof of Authorized Signatory (PAN/Aadhaar)', category: 'Identity', status: 'Uploaded' }
    ]
  });

  // Keep form data synchronized if profile changes externally
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        ...profile,
        bankAccount: {
          ...prev.bankAccount,
          ...(profile.bankAccount || {})
        }
      }));
    }
  }, [profile]);

  const liveCompletion = calculateBorrowerProfileCompletion(formData);

  const handleDocumentToggle = (docId: string) => {
    const updatedDocs = (formData.documents || []).map(doc => {
      if (doc.id === docId) {
        const nextStatus = doc.status === 'Verified' ? 'Uploaded' : 'Verified';
        return { ...doc, status: nextStatus as BusinessDocument['status'] };
      }
      return doc;
    });
    setFormData({ ...formData, documents: updatedDocs });
  };

  const handleSimulateBankVerify = () => {
    setIsSimulatingBank(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        bankAccount: {
          accountHolderName: prev.businessName || prev.authorizedPersonName || 'Apex Precision Components',
          bankName: prev.bankAccount?.bankName || 'State Bank of India',
          accountNumber: prev.bankAccount?.accountNumber || '38291048201',
          ifsc: prev.bankAccount?.ifsc || 'SBIN0001824',
          accountType: prev.bankAccount?.accountType || 'Current',
          verificationStatus: 'Verified'
        }
      }));
      setIsSimulatingBank(false);
    }, 900);
  };

  const handleSimulateVerificationSubmission = () => {
    setIsSimulatingVerification(true);
    setTimeout(() => {
      const updatedDocs = (formData.documents || []).map(d => ({ ...d, status: 'Verified' as const }));
      const newStatus = formData.verificationStatus === 'VERIFIED' ? 'NOT_STARTED' : 'VERIFIED';
      const newVisibility = newStatus === 'VERIFIED' ? 'DISCOVERABLE' : 'UNDER_VERIFICATION';

      const updated = {
        ...formData,
        documents: updatedDocs,
        verificationStatus: newStatus,
        visibilityStatus: newVisibility,
        profileStatus: newStatus === 'VERIFIED' ? 'COMPLETE' : 'UNDER_REVIEW',
        profileCompletion: newStatus === 'VERIFIED' ? 100 : 75,
        bankAccount: {
          ...formData.bankAccount!,
          verificationStatus: 'Verified' as const
        }
      };

      setFormData(updated);
      updateBorrowerProfile(updated);
      setIsSimulatingVerification(false);
      setIsSaved(true);
      setSaveMessage(
        newStatus === 'VERIFIED'
          ? 'Verification successful! Your enterprise is now VERIFIED and DISCOVERABLE by lenders.'
          : 'Verification reset to NOT_STARTED for testing.'
      );
      setTimeout(() => setIsSaved(false), 5000);
    }, 1200);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = {
      ...formData,
      profileCompletion: liveCompletion.totalPercentage,
      profileStatus: liveCompletion.statusBadge,
      visibilityStatus: liveCompletion.visibilityStatus,
      verificationStatus: liveCompletion.verificationStatus
    };
    updateBorrowerProfile(updated);
    setIsSaved(true);
    setSaveMessage('Profile saved successfully! Marketplace visibility updated.');
    setTimeout(() => setIsSaved(false), 4000);
  };

  const tabs = [
    { id: 'authorized', label: '1. Authorized Person', icon: User, complete: !!(formData.authorizedPersonName && formData.mobile) },
    { id: 'identity', label: '2. Business Identity', icon: Building2, complete: !!(formData.businessName && formData.city && formData.state) },
    { id: 'statutory', label: '3. Statutory & Tax', icon: FileBadge, complete: !!(formData.pan && formData.gstin) },
    { id: 'financial', label: '4. Financial Info', icon: DollarSign, complete: !!(formData.annualRevenue && formData.monthlyRevenue) },
    { id: 'bank', label: '5. Banking Info', icon: CreditCard, complete: formData.bankAccount?.verificationStatus === 'Verified' },
    { id: 'operations', label: '6. Operations', icon: Briefcase, complete: !!(formData.employeesCount && formData.majorCustomers) },
    { id: 'requirements', label: '7. Financing Needs', icon: TrendingUp, complete: !!(formData.requestedAmount && formData.purpose) },
    { id: 'documents', label: '8. Documents', icon: FileText, complete: formData.documents?.some(d => d.status === 'Uploaded' || d.status === 'Verified') },
    { id: 'verification', label: '9. Verification & Audit', icon: ShieldCheck, complete: formData.verificationStatus === 'VERIFIED' },
    { id: 'consent', label: '10. Consent & Terms', icon: FileCheck2, complete: !!(formData.termsAccepted && formData.privacyAccepted && formData.dataConsentAccepted) }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
          <Building2 className="w-3.5 h-3.5" /> Borrower Business Profile & Verification Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Complete Your Business Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Provide your business identity, statutory filings, and bank feeds. Once verified, your enterprise becomes discoverable to institutional and individual lenders on the CodeVest marketplace.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">{saveMessage}</div>
        </div>
      )}

      {/* Profile Completion & Visibility Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Marketplace Visibility
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                liveCompletion.visibilityStatus === 'DISCOVERABLE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : liveCompletion.visibilityStatus === 'UNDER_VERIFICATION'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {liveCompletion.visibilityStatus.replace(/_/g, ' ')}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                liveCompletion.statusBadge === 'COMPLETE'
                  ? 'bg-emerald-600 text-white'
                  : liveCompletion.statusBadge === 'UNDER_REVIEW'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}>
                {liveCompletion.statusBadge}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {liveCompletion.totalPercentage}% Business Profile Completed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {liveCompletion.visibilityStatus === 'DISCOVERABLE'
                ? 'Your enterprise is fully verified and discoverable by registered lenders.'
                : 'Complete required profile sections and statutory verification to become discoverable to lenders.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
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
                liveCompletion.totalPercentage >= 80
                  ? 'bg-emerald-500'
                  : liveCompletion.totalPercentage >= 50
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${liveCompletion.totalPercentage}%` }}
            />
          </div>
        </div>

        {/* Step checklist chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-2.5 rounded-xl text-left border transition text-xs flex items-center justify-between cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-500 bg-emerald-50/50 font-semibold text-emerald-900'
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
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.complete && <Check className="w-3 h-3 text-emerald-600 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: AUTHORIZED PERSON */}
          {activeTab === 'authorized' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Authorized Representative Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Information of the designated director, partner, or authorized signatory managing this borrowing facility.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (Authorized Person) *
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedPersonName}
                    onChange={e => setFormData({ ...formData, authorizedPersonName: e.target.value })}
                    placeholder="Enter authorized signatory name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Role in Company *
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Managing Director, Founder & CEO, Partner"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official / Corporate Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('identity'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Business Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BUSINESS IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Business Identity & Structure</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Legal entity registration, corporate addresses, and industry sector classification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Legal Registered Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Apex Precision Engineering Pvt Ltd"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trade Name / Brand (if different)
                  </label>
                  <input
                    type="text"
                    value={formData.tradeName || ''}
                    onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="Brand or trade mark"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entity Legal Type *
                  </label>
                  <select
                    value={formData.entityType}
                    onChange={e => setFormData({ ...formData, entityType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="Private Limited">Private Limited Company</option>
                    <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Public Limited">Public Limited Company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry / Sector *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="Manufacturing">Manufacturing & Precision Engineering</option>
                    <option value="Agri-Tech">Agri-Tech & Food Processing</option>
                    <option value="Textiles">Textiles & Apparel</option>
                    <option value="Automotive">Automotive Components</option>
                    <option value="Healthcare">Healthcare & Pharmaceuticals</option>
                    <option value="Logistics">Logistics, Warehousing & Supply Chain</option>
                    <option value="Electronics">Electronics & Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year of Establishment / Incorporation *
                  </label>
                  <input
                    type="number"
                    min={1970}
                    max={new Date().getFullYear()}
                    value={formData.yearEstablished}
                    onChange={e => setFormData({ ...formData, yearEstablished: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialized Business Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. CNC Aerospace Milling"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Office Address *
                  </label>
                  <input
                    type="text"
                    value={formData.registeredAddress}
                    onChange={e => setFormData({ ...formData, registeredAddress: e.target.value })}
                    placeholder="Plot / Survey No., Industrial Area, Street"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Pune, Coimbatore, Ahmedabad"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra, Tamil Nadu, Gujarat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('authorized')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('statutory'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Statutory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STATUTORY & TAX REGISTRATION */}
          {activeTab === 'statutory' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Statutory Registrations & Identifiers</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  PAN, GSTIN, and MCA identifiers used for automated financial registry checks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Entity PAN *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.pan}
                    onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="AAACR1234F"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Permanent Account Number of the legal borrowing entity.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Goods & Services Tax Identification Number (GSTIN) *
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AAACR1234F1Z5"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Active GSTIN used for automated monthly return filing cross-checks.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Identification Number (CIN) / LLPIN
                  </label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={e => setFormData({ ...formData, cin: e.target.value.toUpperCase() })}
                    placeholder="U29299PN2018PTC179201"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Registered with Ministry of Corporate Affairs (MCA).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Udyam MSME Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.udyamNumber || ''}
                    onChange={e => setFormData({ ...formData, udyamNumber: e.target.value.toUpperCase() })}
                    placeholder="UDYAM-MH-12-0012345"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Optional MSME ministry enterprise registration number.
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('identity')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('financial'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Financials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL INFORMATION */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Financial Information & Revenue Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audited annual turnover, monthly operating metrics, and existing debt commitments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Turnover / Revenue (Last FY) (INR) *
                  </label>
                  <input
                    type="number"
                    step={100000}
                    value={formData.annualRevenue || ''}
                    onChange={e => setFormData({ ...formData, annualRevenue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                    Formatted: {formatINR(formData.annualRevenue || 0)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Average Monthly Revenue (INR) *
                  </label>
                  <input
                    type="number"
                    step={50000}
                    value={formData.monthlyRevenue || ''}
                    onChange={e => setFormData({ ...formData, monthlyRevenue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                    Formatted: {formatINR(formData.monthlyRevenue || 0)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Average Monthly Operating Expenses (INR) *
                  </label>
                  <input
                    type="number"
                    step={50000}
                    value={formData.monthlyExpenses || ''}
                    onChange={e => setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                    Formatted: {formatINR(formData.monthlyExpenses || 0)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Existing Debt / Outstanding Loans (INR)
                  </label>
                  <input
                    type="number"
                    step={50000}
                    value={formData.existingDebt || 0}
                    onChange={e => setFormData({ ...formData, existingDebt: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                    Formatted: {formatINR(formData.existingDebt || 0)}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Debt Servicing / EMI Obligations (INR)
                  </label>
                  <input
                    type="number"
                    step={10000}
                    value={formData.monthlyDebtObligation || 0}
                    onChange={e => setFormData({ ...formData, monthlyDebtObligation: Number(e.target.value) })}
                    className="w-full max-w-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('statutory')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('bank'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Banking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: BANKING INFORMATION */}
          {activeTab === 'bank' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Banking Information & Cash Flow Account</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Primary operational bank account for disbursement and repayment NACH/e-mandates.
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                  formData.bankAccount?.verificationStatus === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  Bank Status: {formData.bankAccount?.verificationStatus || 'Not Added'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Account Holder Name (Must match Entity) *
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount?.accountHolderName || ''}
                    onChange={e => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount!, accountHolderName: e.target.value }
                    })}
                    placeholder="As recorded in bank statements"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
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
                    placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount?.accountNumber || ''}
                    onChange={e => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount!, accountNumber: e.target.value }
                    })}
                    placeholder="Enter current / CC account number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
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
                    placeholder="SBIN0001824"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={formData.bankAccount?.accountType || 'Current'}
                    onChange={e => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount!, accountType: e.target.value as any }
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="Current">Current Account</option>
                    <option value="Cash Credit">Cash Credit (CC) Facility</option>
                    <option value="Overdraft">Overdraft (OD) Facility</option>
                  </select>
                </div>
              </div>

              {/* Bank Verification Simulation */}
              <div className="p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950">Bank Account & Penny-Drop Verification</span>
                </div>
                <p className="text-xs text-slate-600">
                  Simulate an automated penny-drop verification to confirm account ownership and title match.
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
                      <span>Validating Account Aggregator Feed...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{formData.bankAccount?.verificationStatus === 'Verified' ? 'Re-Verify Account' : 'Simulate Bank Verification'}</span>
                    </>
                  )}
                </button>
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
                  onClick={() => { handleSave(); setActiveTab('operations'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Operations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: BUSINESS OPERATIONS */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Business Operations & Counterparties</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Operating model, workforce size, client concentration, and supplier dependencies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Business Model *
                  </label>
                  <select
                    value={formData.businessModel || 'B2B'}
                    onChange={e => setFormData({ ...formData, businessModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="B2B">B2B (Business-to-Business)</option>
                    <option value="B2G">B2G (Business-to-Government / PSU)</option>
                    <option value="B2C">B2C (Direct Consumer)</option>
                    <option value="Hybrid">Hybrid B2B & B2C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee / Workforce Count *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.employeesCount || 10}
                    onChange={e => setFormData({ ...formData, employeesCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Products & Industrial Capabilities *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.keyProducts || ''}
                    onChange={e => setFormData({ ...formData, keyProducts: e.target.value })}
                    placeholder="e.g. Precision CNC components, die tooling, hydraulic assembly"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Top 3-5 Customers & Industry Sectors *
                  </label>
                  <input
                    type="text"
                    value={formData.majorCustomers || ''}
                    onChange={e => setFormData({ ...formData, majorCustomers: e.target.value })}
                    placeholder="e.g. Tata Motors, Bharat Forge, Mahindra & Mahindra"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Telemetry engine cross-checks counterparties to establish low concentration risk.
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Top 3-5 Major Suppliers *
                  </label>
                  <input
                    type="text"
                    value={formData.majorSuppliers || ''}
                    onChange={e => setFormData({ ...formData, majorSuppliers: e.target.value })}
                    placeholder="e.g. Jindal Stainless, Hindalco Industries, local certified alloy vendors"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Main Revenue Channels *
                  </label>
                  <input
                    type="text"
                    value={formData.revenueSources || ''}
                    onChange={e => setFormData({ ...formData, revenueSources: e.target.value })}
                    placeholder="e.g. Direct OEM supply contracts (80%), Aftermarket spare distribution (20%)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
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
                  onClick={() => { handleSave(); setActiveTab('requirements'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Financing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: FINANCING REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Financing Facility Requirements</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Facility ticket size, use of proceeds, preferred repayment cycle, and revenue source.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Financing Amount (INR) *
                  </label>
                  <input
                    type="number"
                    step={100000}
                    value={formData.requestedAmount || ''}
                    onChange={e => setFormData({ ...formData, requestedAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                    Formatted: {formatINR(formData.requestedAmount || 0)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Facility Tenure *
                  </label>
                  <select
                    value={formData.preferredTenure || '12 Months'}
                    onChange={e => setFormData({ ...formData, preferredTenure: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="3 Months">3 Months (Working Capital Bridge)</option>
                    <option value="6 Months">6 Months (Inventory Turnover)</option>
                    <option value="9 Months">9 Months (Supply Contract)</option>
                    <option value="12 Months">12 Months (Standard Facility)</option>
                    <option value="18 Months">18 Months (Expansion Loan)</option>
                    <option value="24 Months">24 Months (Machinery & Capex)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purpose of Financing (Use of Proceeds) *
                  </label>
                  <input
                    type="text"
                    value={formData.purpose || ''}
                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g. Bulk raw material procurement for confirmed aerospace purchase orders"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Source of Repayment *
                  </label>
                  <input
                    type="text"
                    value={formData.expectedRepaymentSource || ''}
                    onChange={e => setFormData({ ...formData, expectedRepaymentSource: e.target.value })}
                    placeholder="e.g. Monthly billed receivables from Tier-1 automotive OEMs"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('operations')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('documents'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENT CENTER */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Document Center & Regulatory Filings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official statutory documents, banking records, and corporate credentials for marketplace verification.
                </p>
              </div>

              <div className="space-y-3">
                {formData.documents?.map(doc => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
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
                        onClick={() => handleDocumentToggle(doc.id)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                        <span>Toggle Status</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('requirements')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { handleSave(); setActiveTab('verification'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: VERIFICATION STATUS & SIMULATION ACTION */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Marketplace Verification & Telemetry Audit</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit results from MCA filings, GST returns, and continuous Account Aggregator banking feeds.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Verification State</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formData.verificationStatus.replace(/_/g, ' ')}
                  </div>
                  <span className="text-[10px] text-slate-500 block">MCA & statutory check</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Marketplace Visibility</div>
                  <div className={`text-base font-extrabold ${formData.visibilityStatus === 'DISCOVERABLE' ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {formData.visibilityStatus.replace(/_/g, ' ')}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {formData.visibilityStatus === 'DISCOVERABLE' ? 'Visible to registered lenders' : 'Private & hidden from lenders'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Trust Health Score</div>
                  <div className="text-base font-extrabold text-blue-600">
                    {formData.healthScore || 85} / 100
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Tier-1 MSME Rating</span>
                </div>
              </div>

              {/* Mandatory Section 8: Simulated Verification Action Button */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                  <h4 className="text-sm font-bold text-emerald-950">Marketplace Verification Action</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                  Use this simulated action to test the transition from <strong>INCOMPLETE</strong> to <strong>UNDER VERIFICATION</strong> and <strong>DISCOVERABLE</strong>. Once discoverable, your business facility immediately appears in the lender discovery pipeline.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSimulatingVerification}
                    onClick={handleSimulateVerificationSubmission}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSimulatingVerification ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to Telemetry Engine...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {formData.verificationStatus === 'VERIFIED'
                            ? 'Toggle / Re-simulate Verification'
                            : 'Submit for Marketplace Verification'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
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
                  onClick={() => { handleSave(); setActiveTab('consent'); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save & Continue to Consent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: CONSENT & DISCLOSURES */}
          {activeTab === 'consent' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Regulatory Consent & Disclosures</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory authorizations for GST return pull, Account Aggregator telemetry, and CodeVest platform terms.
                </p>
              </div>

              <div className="space-y-3.5">
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dataConsentAccepted}
                    onChange={e => setFormData({ ...formData, dataConsentAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Financial Data Verification Consent:</span> I grant authorization for CodeVest to fetch and verify GST filings (GSTR-1, GSTR-3B) and continuous bank telemetry via licensed Account Aggregators.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={e => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Continuous Telemetry Monitoring:</span> I consent to ongoing algorithmic monitoring of operational cash flow health throughout the active financing facility tenure.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">CodeVest Platform Operating Agreement:</span> I declare that all business representations, debt disclosures, and financial parameters are accurate and authorized by board resolution or partner consent.
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('verification')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Finalize & Save Complete Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
