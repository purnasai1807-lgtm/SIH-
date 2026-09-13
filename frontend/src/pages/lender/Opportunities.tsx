import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Sliders,
  DollarSign,
  ArrowUpDown,
  Lock,
  ArrowRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { ScoreGauge } from '../../components/common/ScoreGauge';
import { FinanceModal } from '../../components/lender/FinanceModal';
import { formatINR } from '../../utils/formatters';
import { FinancingOpportunity } from '../../types';

export const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isEligible = user?.lenderProfile?.eligibilityStatus === 'ELIGIBLE';

  const [opportunities, setOpportunities] = useState<FinancingOpportunity[]>(() => {
    const list = dataService.getOpportunitiesSync();
    return Array.isArray(list) ? list : [];
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState<FinancingOpportunity | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minScore, setMinScore] = useState<number>(75);
  const [sortBy, setSortBy] = useState<'score' | 'return' | 'amount'>('score');

  const categories = ['All', 'Manufacturing', 'Automotive', 'Logistics', 'Healthcare', 'Textiles'];

  const filteredOpportunities = useMemo(() => {
    return (opportunities || [])
      .filter(opp => {
        const matchesSearch =
          opp.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.industry.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'All' || opp.industry === selectedCategory || opp.category === selectedCategory;
        const matchesScore = opp.trustScore.overallScore >= minScore;
        return matchesSearch && matchesCategory && matchesScore;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.trustScore.overallScore - a.trustScore.overallScore;
        if (sortBy === 'amount') return b.requestedAmount - a.requestedAmount;
        // Parse return rate like "15.5% p.a."
        const returnA = parseFloat(a.expectedReturnRate) || 0;
        const returnB = parseFloat(b.expectedReturnRate) || 0;
        return returnB - returnA;
      });
  }, [opportunities, searchQuery, selectedCategory, minScore, sortBy]);

  const lenderTolerance = user?.lenderProfile?.preferredDownsideTolerance || 100000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verified Financing Opportunities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional pipeline of MSMEs verified via MCA, GSTIN, and continuous Account Aggregator banking feeds.
          </p>
        </div>

        <Link
          to="/lender/what-if"
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" /> Scenario Simulator
        </Link>
      </div>

      {/* Incomplete Lender Eligibility Warning Banner */}
      {!isEligible && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-950">
                Lender Profile Incomplete — Financing Restricted
              </div>
              <div className="text-xs text-amber-800 mt-0.5">
                You can browse verified opportunities and inspect business health metrics, but financing participation is locked until your identity and bank account are verified.
              </div>
            </div>
          </div>
          <Link
            to="/lender/profile"
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by business name, city, or industry..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-600"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  Industry: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-600"
            >
              <option value="score">Sort: Highest Trust Health Score</option>
              <option value="return">Sort: Highest Expected Return</option>
              <option value="amount">Sort: Financing Ticket Size</option>
            </select>
          </div>
        </div>

        {/* Sliders and Quick Criteria */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Min Trust Health Score:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={70}
                max={90}
                step={5}
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-28 accent-blue-600"
              />
              <span className="font-bold text-blue-600">{minScore}+ / 100</span>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Showing <strong>{filteredOpportunities.length}</strong> of {opportunities.length} opportunities
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No opportunities match current criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, lowering the minimum Trust Health Score, or changing the selected industry.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMinScore(70);
            }}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOpportunities.map(opp => {
            const fundedPercent = Math.min(100, Math.round((opp.fundedAmount / opp.requestedAmount) * 100));
            const remainingAmount = opp.requestedAmount - opp.fundedAmount;

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/lender/opportunities/${opp.id}`}
                          className="font-bold text-base text-slate-900 hover:text-blue-600 transition"
                        >
                          {opp.businessName}
                        </Link>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                          {opp.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {opp.city}, {opp.state} • Established {opp.yearEstablished} • {opp.employeesCount} Employees
                      </p>
                    </div>

                    <ScoreGauge score={opp.trustScore.overallScore} size="sm" label="Trust Score" />
                  </div>

                  {/* Purpose */}
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    <strong>Financing Purpose:</strong> {opp.purpose}
                  </p>

                  {/* Key Ratios */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Expected Return</span>
                      <span className="font-bold text-blue-600">{opp.expectedReturnRate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tenure</span>
                      <span className="font-bold text-slate-900">{opp.tenureMonths} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Repayment DSCR</span>
                      <span className="font-bold text-emerald-600">{opp.repaymentCoverageRatio}x</span>
                    </div>
                  </div>

                  {/* Customer Dependency Signal */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50/60 px-3 py-2 rounded-lg border border-slate-100">
                    <span>Primary Customer Share:</span>
                    <span className="font-semibold text-slate-800">
                      {opp.customerDependencies[0]?.name || 'Diversified'} ({opp.customerDependencies[0]?.sharePercentage || 20}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Funded: <strong>{formatINR(opp.fundedAmount)}</strong> ({fundedPercent}%)
                      </span>
                      <span className="text-slate-700 font-bold">
                        Target: {formatINR(opp.requestedAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${fundedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Remaining: <strong className="text-slate-900">{formatINR(remainingAmount)}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/lender/what-if?opportunityId=${opp.id}`)}
                      title="Run scenario stress test"
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-blue-600" /> Simulate
                    </button>
                    <Link
                      to={`/lender/opportunities/${opp.id}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                    >
                      Diligence
                    </Link>
                    <button
                      onClick={() => setSelectedOpportunity(opp)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                    >
                      Finance
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Finance Modal */}
      {selectedOpportunity && (
        <FinanceModal
          opportunity={selectedOpportunity}
          userLenderProfile={user?.lenderProfile}
          onClose={() => setSelectedOpportunity(null)}
          onSuccess={() => {
            setOpportunities(dataService.getOpportunitiesSync());
          }}
        />
      )}
    </div>
  );
};
