import { dataService } from './dataService';
import { FinancingOpportunity, ActivePortfolioPosition } from '../types';

class FinancingService {
  public getOpportunities(): FinancingOpportunity[] {
    return dataService.getFinancingRequests();
  }

  public getOpportunityById(id: string): FinancingOpportunity | undefined {
    return dataService.getFinancingRequestById(id);
  }

  public submitFinancingRequest(request: FinancingOpportunity): void {
    dataService.addFinancingRequest(request);
  }

  public getPortfolioPositions(lenderId?: string): ActivePortfolioPosition[] {
    return dataService.getPortfolioPositions(lenderId);
  }

  public addCommitment(position: ActivePortfolioPosition): void {
    dataService.addPortfolioPosition(position);
  }
}

export const financingService = new FinancingService();
