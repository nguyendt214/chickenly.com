import { Component } from '@angular/core';
import { AuthService } from '../../../main/auth.service';
import { UtilService } from '../../../main/util.service';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive id="kmenu-sidebar" *ngIf="isLogged">
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <div class="kloading" *ngIf="!utilService.loaded">
          <mat-progress-spinner
            class="example-margin"
            [color]="'accent'"
            [mode]="'indeterminate'"
            [value]="30">
          </mat-progress-spinner>
        </div>
        <ng-content select="router-outlet" *ngIf="utilService.loaded"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <ngx-footer></ngx-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent {
  isLogged = false;

  constructor(
    public authService: AuthService,
    public utilService: UtilService,
  ) {
    this.isLogged = this.authService.isLogged();
  }

}
