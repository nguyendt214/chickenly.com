import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Category, Customer, ProductType, School } from '../../main/main.model';

@Component({
  selector: 'app-product-type-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent {
  model: ProductType = new ProductType();

  constructor(
    private mainService: MainService,
    private utilService: UtilService,
  ) {  }

  public add() {
    this.mainService.addNew(this.model).then(() => {
      this.utilService.gotoPage('product-type');
    });
  }
}
