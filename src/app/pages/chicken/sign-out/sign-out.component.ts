import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent {
  constructor(
    private router: Router,
  ) {
    localStorage.removeItem('user');
    this.router.navigate(['pages/login']).then(() => {
      window.location.reload();
    });
  }
}
