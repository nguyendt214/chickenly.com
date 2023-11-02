import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Category, Customer, School } from '../../main/main.model';

@Component({
  selector: 'app-category-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent {
  public customer: Customer = new Customer();
  customers: Customer[] = [];
  dataSource: Customer[] = [];
  school: School = new School();
  model: Category = new Category();

  constructor(
    private mainService: MainService,
    private utilService: UtilService,
  ) {  }

  public add() {
    this.mainService.addNew(this.model).then(() => {
      this.utilService.gotoPage('category');
    });
  }
}
