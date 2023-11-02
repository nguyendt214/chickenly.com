import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Customer, School } from '../../main/main.model';

@Component({
  selector: 'app-school-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent {
  public customer: Customer = new Customer();
  customers: Customer[] = [];
  dataSource: Customer[] = [];
  model: School = new School();

  constructor(
    private mainService: MainService,
    private utilService: UtilService,
  ) {
    this.getList();
  }

  public add() {
    this.mainService.addNew(this.model).then(() => {
      this.utilService.gotoPage('school');
    });
  }
  getList() {
    this.customers = this.mainService.retrieveData(this.mainService.mO.customer).subscribe(
      (data: any) => {
        this.customers = this.dataSource = data;
      }
    );
  }
}
