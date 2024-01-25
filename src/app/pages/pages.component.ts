import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { AuthService } from '../main/auth.service';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" (click)="menuCick()"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  isLogged = false;
  constructor(
    private authService: AuthService
  ) { }
  menu = this.authService.isLogged() ? MENU_ITEMS : [];

  menuCick() {
    const kmenuSidebar = document.getElementById('kmenu-sidebar');
    if (kmenuSidebar.classList.contains('expanded')) {
      document.getElementById('humberger-menu').click();
    }
  }
}
