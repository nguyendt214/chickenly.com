import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Category, Customer, Product, ProductType, School } from '../../main/main.model';

@Component({
  selector: 'app-product-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent {
  public customer: Customer = new Customer();
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  dataSource: Customer[] = [];
  model: Product = new Product();

  constructor(
    private mainService: MainService,
    private utilService: UtilService,
  ) {
    this.getList();
  }

  public add() {
    this.mainService.addNew(this.model).then(() => {
      this.utilService.gotoPage('product');
    });
  }
  getList() {
    this.mainService.retrieveData(this.mainService.mO.category).subscribe(
      (data: any) => {
        this.categories = this.dataSource = data;
      }
    );
    this.mainService.retrieveData(this.mainService.mO.productType).subscribe(
      (data: any) => {
        this.productTypes = this.dataSource = data;
      }
    );
  }
}
