import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from "../../../main/util.service";
import { LocalStorageService } from "../../../main/local-storage.servise";

@Component({
  selector: 'ngx-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent {
  constructor(
    private router: Router,
    private utilService: UtilService,
    private lc: LocalStorageService,
  ) {
    localStorage.removeItem('user');
    localStorage.removeItem('user-1');
    this.lc.removeItem('user-1');
    this.router.navigate(['pages/login']).then(() => {
      window.location.reload();
    });
  }
}
