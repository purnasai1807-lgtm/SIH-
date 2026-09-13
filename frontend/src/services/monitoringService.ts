import { dataService } from './dataService';
import { MonitoringEvent, PlatformAlert } from '../types';

class MonitoringService {
  public getEvents(businessId?: string): MonitoringEvent[] {
    return dataService.getMonitoringEvents(businessId);
  }

  public getAlerts(): PlatformAlert[] {
    return dataService.getAlerts();
  }

  public resolveAlert(id: string): void {
    dataService.markAlertAsRead(id);
  }

  public createAlert(alert: PlatformAlert): void {
    dataService.addAlert(alert);
  }
}

export const monitoringService = new MonitoringService();
