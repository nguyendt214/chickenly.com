import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { NB_AUTH_OPTIONS, NbAuthService, NbLoginComponent } from '@nebular/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../../main/auth.service';
import { UtilService } from "../../../main/util.service";

@Component({
  selector: 'ngx-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent extends NbLoginComponent {
  isLogged = false;

  constructor(
    @Inject(NbAuthService) service: NbAuthService,
    @Inject(NB_AUTH_OPTIONS) options: {},
    @Inject(ChangeDetectorRef) cd: ChangeDetectorRef,
    @Inject(Router) router: Router,
    private authService: AuthService,
    private utilService: UtilService,
  ) {
    super(service, options, cd, router);
    this.isLogged = this.authService.isLogged();
    this.utilService.appLoaded();
    if(this.isLogged) {
      this.router.navigate(['pages/chicken/doanh-thu']);
    }
  }

  login() {
    super.login();
  }

}
