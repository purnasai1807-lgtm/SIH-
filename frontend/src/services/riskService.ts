import { dataService } from './dataService';
import { RiskItem, BusinessTrustHealthScore } from '../types';

class RiskService {
  public getRiskItems(businessId?: string): RiskItem[] {
    return dataService.getRiskAssessment(businessId);
  }

  public getHealthScore(businessId?: string): BusinessTrustHealthScore {
    return dataService.getHealthScore(businessId);
  }

  public updateHealthScore(businessId: string, score: BusinessTrustHealthScore): void {
    dataService.setHealthScore(businessId, score);
  }
}

export const riskService = new RiskService();
