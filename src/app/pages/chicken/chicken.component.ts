import { Component, OnInit } from '@angular/core';
import { Customer } from '../../main/main.model';
import { MainService } from '../../main/main.service';

@Component({
  selector: 'ngx-tables',
  template: `<router-outlet></router-outlet>`,
})
export class ChickenComponent implements OnInit {
  customers: Customer[] = [];
  constructor(
    private mainService: MainService,
  ) {}


  ngOnInit(): void {}
}
