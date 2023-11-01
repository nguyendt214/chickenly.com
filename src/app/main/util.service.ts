import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(
    private router: Router,
  ) { }

  gotoPage(path: string) {
    this.router.navigate([path]);
  }
}
