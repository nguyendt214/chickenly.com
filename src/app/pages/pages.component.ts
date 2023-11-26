import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';

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

  menu = MENU_ITEMS;

  menuCick() {
    const kmenuSidebar = document.getElementById('kmenu-sidebar');
    if (kmenuSidebar.classList.contains('expanded')) {
      document.getElementById('humberger-menu').click();
    }
  }
}
