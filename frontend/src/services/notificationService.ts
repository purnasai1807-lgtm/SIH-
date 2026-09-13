export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY_NOTIFS = 'codevest_notifications';

class NotificationService {
  private getStored(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getNotifications(userId?: string): NotificationItem[] {
    const list = this.getStored();
    if (userId) {
      return list.filter(n => !n.userId || n.userId === userId);
    }
    return list;
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const list = this.getStored();
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    list.unshift(item);
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(list));
  }

  public markAsRead(id: string): void {
    const list = this.getStored().map(n => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(list));
  }
}

export const notificationService = new NotificationService();
