import { dataService } from './dataService';
import { User, UserRole } from '../types';

class UserService {
  public getAllUsers(): User[] {
    return dataService.getUsers();
  }

  public getUsersByRole(role: UserRole): User[] {
    return dataService.getUsers().filter(u => u.role === role);
  }

  public getUserById(id: string): User | undefined {
    return dataService.getUserById(id);
  }
}

export const userService = new UserService();
