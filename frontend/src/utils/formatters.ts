/**
 * Indian Rupee (INR) and Financial Formatting Utilities
 * Adheres strictly to Indian Fintech standards and non-insurance regulatory language.
 */

export const formatINR = (amount: number, compact: boolean = false): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';

  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} K`;
    }
  }

  // Format full Indian Rupee numbering format (e.g. ₹15,00,000)
  const isNegative = amount < 0;
  const numStr = Math.abs(Math.round(amount)).toString();
  
  let lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `${isNegative ? '-' : ''}₹${formatted}`;
};

export const formatPercent = (val: number, decimals: number = 1): string => {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
};

export const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

/**
 * MANDATORY REGULATORY & ACCURACY DISCLAIMERS:
 * CodeVest is NOT an insurance product.
 * Downside tolerance is NOT a loss cap, reserve, or recovery guarantee.
 */
export const DOWNSIDE_TOLERANCE_DISCLAIMER =
  'Preferred downside tolerance represents your preferred risk threshold for decision-making and opportunity ranking. It does not guarantee, cap, insure, reimburse, or otherwise limit actual financial loss. CodeVest is not an insurance product.';

export const MODEL_INDICATED_DISCLAIMER =
  'Scores and simulations are model-based analytical indicators designed for decision-support and do not constitute guaranteed forecasts or repayment covenants.';
