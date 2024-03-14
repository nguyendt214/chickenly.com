import { Injectable } from '@angular/core';
import { User } from '../@core/data/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User
  login(user) {

  }

  isLogged() {
    return localStorage.getItem('user-1') !== null;
  }
}
