import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Customer } from '../../main/main.model';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent {
  public customer: Customer = new Customer();

  constructor(
    private mainService: MainService,
    private utilService: UtilService,
  ) { }

  public add() {
    this.mainService.addNew(this.customer).then(() => {
      this.utilService.gotoPage('customers');
    });;
  }
}
