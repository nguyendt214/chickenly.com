import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Customer } from '../../main/main.model';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {
  customers: Customer[] = [];
  displayedColumns: string[] = ['name', 'phone', 'address', 'note'];
  dataSource: Customer[] = [];
  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    ) {
    this.getList();
  }
  addNewCustomer() {
    this.utilService.gotoPage('customers/add');
  }
  delete(customer: Customer) {
    this.mainService.kDelete(customer, this.mainService.mO.customer).then(
      () => {
        console.log('OK');
        this.getList();
      }
    );
  }
  edit(customer: Customer){
    this.utilService.gotoPage('customers/edit/' + customer.key);
  }
  getList() {
    this.customers = this.mainService.retrieveData(this.mainService.mO.customer).subscribe(
      (data: any) => {
        this.customers = this.dataSource = data;
      }
    );
  }
}
