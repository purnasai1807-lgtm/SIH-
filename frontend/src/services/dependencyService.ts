import { dataService } from './dataService';
import { DependencyAssessment } from '../types';

class DependencyService {
  public getDependencyAssessment(businessId?: string): DependencyAssessment {
    return dataService.getDependencyAssessment(businessId);
  }
}

export const dependencyService = new DependencyService();
