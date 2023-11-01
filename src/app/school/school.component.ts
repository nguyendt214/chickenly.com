import { Component } from '@angular/core';
import { MainService } from '../main/main.service';
import { UtilService } from '../main/util.service';
import { Customer, School } from '../main/main.model';

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css']
})
export class SchoolComponent {
  customers: Customer[] = [];
  schools: School[] = [];
  displayedColumns: string[] = ['name', 'phone', 'address', 'note'];
  dataSource: Customer[] = [];
  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    ) {
    this.getListCustomer();
    this.getList();
  }
  addNew() {
    this.utilService.gotoPage('school/add');
  }
  delete(e: any) {
    this.mainService.kDelete(e, this.mainService.mO.school).then(
      () => {
        this.getList();
      }
    );
  }
  edit(e: any){
    this.utilService.gotoPage('school/edit/' + e?.key);
  }
  getListCustomer() {
    this.customers = this.mainService.retrieveData(this.mainService.mO.customer).subscribe(
      (data: any) => {
        this.customers = data;
      }
    );
  }
  getList() {
    this.schools = this.mainService.retrieveData(this.mainService.mO.school).subscribe(
      (data: any) => {
        this.schools = this.dataSource = data;
      }
    );
  }

  getCustomerByKey(key: any) {
    let customer: Customer | undefined = (this.customers.filter((customer: Customer) => customer.key === key)).shift();
    return customer?.name;
  }
}
