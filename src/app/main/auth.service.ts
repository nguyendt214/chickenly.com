import { Injectable } from '@angular/core';
import { User } from '../@core/data/users';
import { LocalStorageService } from './local-storage.servise';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User

  constructor(
    private lc: LocalStorageService,
  ) {
  }

  login(user) {

  }

  isLogged() {
    return localStorage.getItem('user-1') !== null;
  }

  isAdminRole(): boolean {
    const user: any = this.lc.getObject('user-1');
    return ['kevin'].includes(user?.username || 'HACK');
  }
}
