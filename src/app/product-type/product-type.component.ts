import { Component } from '@angular/core';
import { MainService } from '../main/main.service';
import { UtilService } from '../main/util.service';
import { Category, Customer, ProductType, School } from '../main/main.model';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.css']
})
export class ProductTypeComponent {
  productTypes: ProductType[] = [];
  displayedColumns: string[] = ['name'];
  dataSource: ProductType[] = [];
  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    ) {
    this.getList();
  }
  addNew() {
    this.utilService.gotoPage('product-type/add');
  }
  delete(e: any) {
    this.mainService.kDelete(e, this.mainService.mO.productType).then(
      () => {
        this.getList();
      }
    );
  }
  edit(e: any){
    this.utilService.gotoPage('product-type/edit/' + e?.key);
  }
  getList() {
    this.mainService.retrieveData(this.mainService.mO.productType).subscribe(
      (data: any) => {
        this.productTypes = this.dataSource = data;
      }
    );
  }
}
