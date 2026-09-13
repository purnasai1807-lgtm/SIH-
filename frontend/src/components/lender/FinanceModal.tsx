import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { FinancingOpportunity } from '../../types';
import { formatINR, DOWNSIDE_TOLERANCE_DISCLAIMER } from '../../utils/formatters';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { DownsideToleranceNotice } from '../common/DownsideToleranceNotice';

interface FinanceModalProps {
  opportunity: FinancingOpportunity;
  onClose: () => void;
  onSuccess: () => void;
}

export const FinanceModal: React.FC<FinanceModalProps> = ({ opportunity, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isEligible = user?.lenderProfile?.eligibilityStatus === 'ELIGIBLE';

  const [step, setStep] = useState<number>(1);
  const [amount, setAmount] = useState<number>(Math.min(500000, opportunity.requestedAmount));
  const [tolerance, setTolerance] = useState<number>(Math.round(amount * 0.2)); // default 20%
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If user is not yet eligible, show restricted modal with CTA to complete profile
  if (!isEligible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-amber-600 mb-1">
              Financing Restricted
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Complete your lender profile before participating in financing.
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              To comply with peer-to-business marketplace regulations, verified KYC identity and bank account details must be completed before committing capital to opportunities.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 mb-1">Missing for Eligibility:</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className={`w-2 h-2 rounded-full ${user?.lenderProfile?.kycStatus === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>Identity & KYC Verification ({user?.lenderProfile?.kycStatus || 'Not Started'})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className={`w-2 h-2 rounded-full ${user?.lenderProfile?.bankAccount?.verificationStatus === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>Bank Account Details ({user?.lenderProfile?.bankAccount?.verificationStatus || 'Not Added'})</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Browse Opportunities
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/lender/profile');
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    setTolerance(Math.round(newAmount * 0.2));
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      dataService.addFinancingCommitment({
        opportunityId: opportunity.id,
        businessName: opportunity.businessName,
        industry: opportunity.industry,
        amount,
        preferredDownsideTolerance: tolerance,
        tenureMonths: opportunity.tenureMonths,
        expectedReturnRate: opportunity.expectedReturnRate
      });
      setIsSubmitting(false);
      onSuccess();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold">
              Financing Intent Workflow
            </div>
            <h2 className="text-base font-bold tracking-tight text-white mt-0.5">
              {opportunity.businessName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          {[
            'Review Business',
            'Risk Review',
            'Financing Amount',
            'Terms & Return',
            'Risk Disclosure',
            'Confirm Intent'
          ].map((sName, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {isDone ? '✓' : stepNum}
                </span>
                <span
                  className={`hidden sm:inline text-[11px] font-medium ${
                    isCurrent ? 'text-blue-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {sName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Body Content by Step */}
        <div className="p-6 space-y-4">
          {/* STEP 1: Review Business */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="text-xs text-slate-500 uppercase font-semibold">Business Identity</div>
                <div className="text-base font-bold text-slate-900 mt-1">{opportunity.businessName}</div>
                <div className="text-xs text-slate-600 mt-0.5">{opportunity.category} • {opportunity.location}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Requested Amount:</span>{' '}
                    <strong className="text-slate-800">{formatINR(opportunity.requestedAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Preferred Tenure:</span>{' '}
                    <strong className="text-slate-800">{opportunity.tenureMonths} Months</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Annual Revenue:</span>{' '}
                    <strong className="text-slate-800">{formatINR(opportunity.revenueAnnual)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Health Score:</span>{' '}
                    <strong className="text-emerald-700">{opportunity.healthScore}/100</strong>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-3.5 rounded-xl">
                <div className="font-semibold text-slate-900 mb-1">Declared Financing Purpose:</div>
                {opportunity.purpose}
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-3.5 rounded-xl">
                <div className="font-semibold text-slate-900 mb-1">Primary Repayment Source:</div>
                {opportunity.repaymentSource}
              </div>
            </div>
          )}

          {/* STEP 2: Review Risk */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium">Model Risk Level</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{opportunity.riskLevel}</div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium">Debt Service (DSCR)</div>
                  <div className="text-base font-bold text-emerald-700 mt-1">{opportunity.debtServiceCoverageRatio}x</div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium">Dependency Risk</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{opportunity.dependencyRisk}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="font-semibold text-slate-900">Key Analytical Indicators:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>36 consecutive months of verified on-time GSTR-3B filings.</li>
                  <li>Account Aggregator verified monthly bank credits averaging ₹22+ Lakhs.</li>
                  <li>Customer concentration Top-1 client: 38% (AAA rated TVS Motor Company vendor unit).</li>
                  <li>Receivable cycle stable at 44 days with zero active court/insolvency proceedings.</li>
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                * Risk levels represent model-indicated assessments and do not constitute guaranteed safety covenants.
              </div>
            </div>
          )}

          {/* STEP 3: Set Financing Amount */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financing Exposure Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    min={100000}
                    max={opportunity.requestedAmount}
                    step={50000}
                    value={amount}
                    onChange={e => handleAmountChange(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Requested by business: {formatINR(opportunity.requestedAmount)}. You may finance full or partial amount.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Preferred Downside Tolerance (INR)
                  </label>
                  <span className="text-xs font-bold text-blue-600">{formatINR(tolerance)}</span>
                </div>
                <input
                  type="range"
                  min={Math.round(amount * 0.05)}
                  max={Math.round(amount * 0.5)}
                  step={10000}
                  value={tolerance}
                  onChange={e => setTolerance(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Conservative ({formatINR(Math.round(amount * 0.05))})</span>
                  <span>Moderate ({formatINR(Math.round(amount * 0.2))})</span>
                  <span>Higher ({formatINR(Math.round(amount * 0.5))})</span>
                </div>
              </div>

              <DownsideToleranceNotice amount={amount} tolerance={tolerance} />
            </div>
          )}

          {/* STEP 4: Review Terms */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Business:</span>
                  <span className="font-semibold text-slate-900">{opportunity.businessName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Financing Exposure:</span>
                  <span className="font-bold text-slate-900">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tenure:</span>
                  <span className="font-semibold text-slate-900">{opportunity.tenureMonths} Months</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Illustrative Expected Return:</span>
                  <span className="font-bold text-blue-600">{opportunity.expectedReturnRate}% p.a.</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Preferred Downside Tolerance:</span>
                  <span className="font-semibold text-slate-800">{formatINR(tolerance)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Estimated Monthly Repayment:</span>
                  <span className="font-bold text-emerald-700">
                    {formatINR(Math.round((amount * (1 + opportunity.expectedReturnRate / 100)) / opportunity.tenureMonths))} / mo
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <strong>Repayment Mechanism:</strong> Repayments are scheduled via authenticated e-NACH mandates backed by verified buyer receivables and escrow reconciliation.
              </div>
            </div>
          )}

          {/* STEP 5: Risk Disclosure */}
          {step === 5 && (
            <div className="space-y-3">
              <div className="border border-rose-200 bg-rose-50/70 p-4 rounded-xl text-xs space-y-2 text-rose-950">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Mandatory Regulatory & Capital Risk Disclosure</span>
                </div>
                <p>
                  1. Business financing involves direct financial exposure to private enterprises. In the event of borrower distress, contract disputes, or economic downturns, you may experience partial or complete loss of capital.
                </p>
                <p>
                  2. <strong>CodeVest is NOT an insurance product.</strong> Your chosen preferred downside tolerance ({formatINR(tolerance)}) does not cap your losses, nor does CodeVest provide capital compensation, guarantees, or reserves.
                </p>
                <p>
                  3. Expected returns ({opportunity.expectedReturnRate}%) are model-projected and subject to business performance.
                </p>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={riskAcknowledged}
                  onChange={e => setRiskAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I have read and acknowledged the risk disclosure. I confirm that I am allocating capital within my risk capacity.
                </span>
              </label>
            </div>
          )}

          {/* STEP 6: Confirm Intent */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                  Final Financing Confirmation
                </div>
                <div className="text-sm">
                  You are about to commit <span className="text-xl font-bold text-white block mt-0.5">{formatINR(amount)}</span> of financing exposure.
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Borrower:</span>
                    <span className="font-semibold text-white">{opportunity.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tenure:</span>
                    <span className="text-white">{opportunity.tenureMonths} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Return:</span>
                    <span className="text-blue-400 font-semibold">{opportunity.expectedReturnRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Score:</span>
                    <span className="text-emerald-400 font-semibold">{opportunity.healthScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preferred Downside Tolerance:</span>
                    <span className="text-slate-300">{formatINR(tolerance)}</span>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={e => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I confirm my intent to provide business financing under CodeVest platform terms. I acknowledge that repayment is not guaranteed.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              disabled={step === 5 && !riskAcknowledged}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!termsAgreed || isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition shadow-md"
            >
              {isSubmitting ? (
                <span>Registering Commitment...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Confirm Financing
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
