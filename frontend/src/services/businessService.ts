import { dataService, BusinessRecord } from './dataService';

class BusinessService {
  public getBusinesses(): BusinessRecord[] {
    return dataService.getBusinesses();
  }

  public getBusinessById(id: string): BusinessRecord | undefined {
    return dataService.getBusinessById(id);
  }

  public getBusinessByOwnerUserId(userId: string): BusinessRecord | undefined {
    return dataService.getBusinessByOwnerUserId(userId);
  }

  public saveBusiness(biz: BusinessRecord): void {
    dataService.saveBusiness(biz);
  }

  public updateVerificationStatus(
    businessId: string,
    status: 'Verified' | 'Pending' | 'In Review' | 'Action Required'
  ): void {
    dataService.updateBusinessVerification(businessId, status);
  }
}

export const businessService = new BusinessService();
