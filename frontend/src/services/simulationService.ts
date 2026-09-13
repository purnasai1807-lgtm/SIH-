import { SimulationScenarioResult, ScenarioSimulationInput } from '../types';

export interface SimulatorInputs {
  baseMonthlyRevenue: number;
  baseMonthlyExpenses: number;
  existingDebtService: number;
  financingAmount: number;
  expectedReturnRate: number; // % p.a.
  tenureMonths: number;
  revenueShockPercent: number; // e.g. -20 for -20%, +10 for +10%
  expenseShockPercent: number; // e.g. +10 for +10%
  customerLossShock: boolean; // loss of top customer (-38% rev)
  receivableDelayDays: number; // e.g. +15, +30 days
}

export class SimulationService {
  public calculateScenarios(inputs: SimulatorInputs): {
    baseCase: SimulationScenarioResult;
    stressCase: SimulationScenarioResult;
    optimisticCase: SimulationScenarioResult;
    monthlyTrajectory: { month: string; baseCash: number; stressCash: number; optCash: number }[];
  } {
    const newDebtService = Math.round(
      (inputs.financingAmount * (1 + (inputs.expectedReturnRate / 100))) / inputs.tenureMonths
    );
    const totalDebtService = inputs.existingDebtService + newDebtService;

    // 1. BASE CASE
    const baseRev = inputs.baseMonthlyRevenue;
    const baseExp = inputs.baseMonthlyExpenses;
    const baseNetCash = baseRev - baseExp - totalDebtService;
    const baseDSCR = Number(((baseRev - baseExp) / Math.max(totalDebtService, 1)).toFixed(2));
    const baseHealth = Math.min(95, Math.max(40, Math.round(75 + (baseDSCR - 1.5) * 12)));
    const baseRisk = Math.max(10, Math.min(90, 100 - baseHealth));

    const baseCase: SimulationScenarioResult = {
      scenarioName: 'Base Case',
      monthlyRevenue: baseRev,
      monthlyExpenses: baseExp + totalDebtService,
      netCashFlow: baseNetCash,
      debtServiceCoverageRatio: baseDSCR,
      modelHealthScore: baseHealth,
      modelRiskScore: baseRisk,
      repaymentCapacityRating: baseDSCR >= 2.0 ? 'Strong' : baseDSCR >= 1.3 ? 'Adequate' : 'Strained',
      probabilityIndicator: 'Baseline Operating Trajectory (65% probability)',
      keyDrivers: ['Historical baseline run-rate', 'Standard customer re-order cadence', 'Stable input costs']
    };

    // 2. STRESS CASE (User sliders applied + shock)
    let revMultiplier = (100 + inputs.revenueShockPercent) / 100;
    if (inputs.customerLossShock) {
      revMultiplier *= 0.62; // loss of 38% top customer
    }
    const stressRev = Math.round(inputs.baseMonthlyRevenue * revMultiplier);

    const expMultiplier = (100 + inputs.expenseShockPercent) / 100;
    const stressExp = Math.round(inputs.baseMonthlyExpenses * expMultiplier);

    // Working capital friction from delayed receivables (e.g. 15 days delay = ~5% working capital drag)
    const workingCapitalFriction = Math.round(stressRev * (inputs.receivableDelayDays / 365) * 0.4);
    const stressNetCash = stressRev - stressExp - totalDebtService - workingCapitalFriction;
    const stressDSCR = Number(((stressRev - stressExp) / Math.max(totalDebtService, 1)).toFixed(2));

    let stressRating: 'Strong' | 'Adequate' | 'Strained' | 'Impaired' = 'Adequate';
    if (stressDSCR < 1.0 || stressNetCash < 0) {
      stressRating = 'Impaired';
    } else if (stressDSCR < 1.4) {
      stressRating = 'Strained';
    }

    const stressHealth = Math.min(90, Math.max(25, Math.round(baseHealth - (1 - (stressRev / baseRev)) * 60 - (inputs.expenseShockPercent * 0.4))));
    const stressRisk = Math.max(15, Math.min(95, 100 - stressHealth));

    const stressCase: SimulationScenarioResult = {
      scenarioName: 'Stress Case',
      monthlyRevenue: stressRev,
      monthlyExpenses: stressExp + totalDebtService + workingCapitalFriction,
      netCashFlow: stressNetCash,
      debtServiceCoverageRatio: Math.max(0.2, stressDSCR),
      modelHealthScore: stressHealth,
      modelRiskScore: stressRisk,
      repaymentCapacityRating: stressRating,
      probabilityIndicator: 'Severe Market Shock Simulation (20% probability)',
      keyDrivers: [
        `${inputs.revenueShockPercent < 0 ? `${inputs.revenueShockPercent}% revenue contraction` : 'Revenue pressure'}`,
        `${inputs.expenseShockPercent > 0 ? `+${inputs.expenseShockPercent}% operational cost inflation` : 'Input price stability'}`,
        inputs.customerLossShock ? 'Top customer contract non-renewal' : 'Customer base maintained',
        inputs.receivableDelayDays > 0 ? `+${inputs.receivableDelayDays} days collection latency` : 'Normal collection cycle'
      ]
    };

    // 3. OPTIMISTIC CASE (+15% revenue, efficient margins)
    const optRev = Math.round(inputs.baseMonthlyRevenue * 1.15);
    const optExp = Math.round(inputs.baseMonthlyExpenses * 1.05);
    const optNetCash = optRev - optExp - totalDebtService;
    const optDSCR = Number(((optRev - optExp) / Math.max(totalDebtService, 1)).toFixed(2));
    const optHealth = Math.min(96, baseHealth + 6);
    const optRisk = Math.max(8, 100 - optHealth);

    const optimisticCase: SimulationScenarioResult = {
      scenarioName: 'Optimistic Case',
      monthlyRevenue: optRev,
      monthlyExpenses: optExp + totalDebtService,
      netCashFlow: optNetCash,
      debtServiceCoverageRatio: optDSCR,
      modelHealthScore: optHealth,
      modelRiskScore: optRisk,
      repaymentCapacityRating: 'Strong',
      probabilityIndicator: 'High-Growth & Margin Expansion (15% probability)',
      keyDrivers: ['Capacity utilization expands to 95%', 'Tier-1 client order volume expands 15%', 'Receivables cycle accelerates']
    };

    // 6-month projected trajectory
    const monthlyTrajectory = [
      { month: 'Month 1', baseCash: baseNetCash, stressCash: stressNetCash, optCash: optNetCash },
      { month: 'Month 2', baseCash: Math.round(baseNetCash * 1.02), stressCash: Math.round(stressNetCash * 0.98), optCash: Math.round(optNetCash * 1.03) },
      { month: 'Month 3', baseCash: Math.round(baseNetCash * 1.04), stressCash: Math.round(stressNetCash * 0.96), optCash: Math.round(optNetCash * 1.06) },
      { month: 'Month 4', baseCash: Math.round(baseNetCash * 1.05), stressCash: Math.round(stressNetCash * 0.95), optCash: Math.round(optNetCash * 1.09) },
      { month: 'Month 5', baseCash: Math.round(baseNetCash * 1.07), stressCash: Math.round(stressNetCash * 0.94), optCash: Math.round(optNetCash * 1.12) },
      { month: 'Month 6', baseCash: Math.round(baseNetCash * 1.09), stressCash: Math.round(stressNetCash * 0.93), optCash: Math.round(optNetCash * 1.15) }
    ];

    return { baseCase, stressCase, optimisticCase, monthlyTrajectory };
  }

  public simulateScenario(opportunity: any, params: ScenarioSimulationInput) {
    const baseRevenue = (opportunity?.metrics?.monthlyRevenue || (opportunity?.revenueAnnual ? opportunity.revenueAnnual / 12 : 0)) || 2000000;
    const baseExpenses = (opportunity?.metrics?.monthlyExpenses) || Math.round(baseRevenue * 0.75);
    const existingDebt = 120000;
    const financingAmount = opportunity?.requestedAmount || 1500000;
    const returnRate = typeof opportunity?.expectedReturnRate === 'number' ? opportunity.expectedReturnRate : 15.5;
    const tenure = opportunity?.tenureMonths || 12;

    const scenarios = this.calculateScenarios({
      baseMonthlyRevenue: baseRevenue,
      baseMonthlyExpenses: baseExpenses,
      existingDebtService: existingDebt,
      financingAmount: financingAmount,
      expectedReturnRate: returnRate,
      tenureMonths: tenure,
      revenueShockPercent: params.revenueChangePercent,
      expenseShockPercent: Math.abs(params.marginContractionPercent),
      customerLossShock: params.primaryCustomerLoss,
      receivableDelayDays: params.receivableDelayDays
    });

    const stressCase = scenarios.stressCase;
    const defaultProb = stressCase.debtServiceCoverageRatio < 1.0 ? 28.4 : stressCase.debtServiceCoverageRatio < 1.3 ? 12.6 : 3.8;

    return {
      projectedDscr: stressCase.debtServiceCoverageRatio,
      projectedCashFlow: stressCase.netCashFlow,
      estimatedDefaultProbability: defaultProb,
      downsideToleranceAssessment: stressCase.debtServiceCoverageRatio >= 1.2
        ? 'Within preferred downside tolerance threshold'
        : 'Potential boundary breach under severe adverse shock'
    };
  }
}

export const simulationService = new SimulationService();
