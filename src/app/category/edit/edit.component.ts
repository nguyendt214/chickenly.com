import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Customer, School } from '../../main/main.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {
  customer: Customer = new Customer();
  customers: Customer[] = [];
  model: School = new School();
  key: string | any;

  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    protected activeRoute: ActivatedRoute,
  ) {
    this.getListCustomer();
    this.key = this.activeRoute.snapshot.paramMap.get('key');
    this.mainService.kDetail(this.key, this.mainService.mO.school).subscribe(
      (data: any) => {
        this.model = data;
      }
    );
  }

  edit() {
    this.mainService.kUpdate(this.key, this.model, this.mainService.mO.school).then(
      () => this.utilService.gotoPage('school')
    );
  }

  getListCustomer() {
    this.customers = this.mainService.retrieveData(this.mainService.mO.customer).subscribe(
      (data: any) => {
        this.customers = data;
      }
    );
  }
}
