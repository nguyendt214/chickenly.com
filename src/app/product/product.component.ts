import { Component } from '@angular/core';
import { MainService } from '../main/main.service';
import { UtilService } from '../main/util.service';
import { Category, Customer, Product, ProductType, School } from '../main/main.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'price', 'priceStock', 'qty', 'note'];
  dataSource: Customer[] = [];
  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    ) {
    this.getListCategory();
    this.getListProductType();
    this.getList();
  }
  addNew() {
    this.utilService.gotoPage('product/add');
  }
  delete(e: any) {
    this.mainService.kDelete(e, this.mainService.mO.product).then(
      () => {
        this.getList();
      }
    );
  }
  edit(e: any){
    this.utilService.gotoPage('product/edit/' + e?.key);
  }
  getListCategory() {
    this.mainService.retrieveData(this.mainService.mO.category).subscribe(
      (data: any) => {
        this.categories = data;
      }
    );
  }
  getListProductType() {
    this.mainService.retrieveData(this.mainService.mO.productType).subscribe(
      (data: any) => {
        this.productTypes = data;
      }
    );
  }
  getList() {
    this.mainService.retrieveData(this.mainService.mO.product).subscribe(
      (data: any) => {
        this.products = this.dataSource = data;
      }
    );
  }

  getCategoryByKey(key: any) {
    let m: Category | undefined = (this.categories.filter((o: Category) => o.key === key)).shift();
    return m?.name;
  }

  getProductTypeByKey(key: any) {
    let m: ProductType | undefined = (this.productTypes.filter((o: ProductType) => o.key === key)).shift();
    return m?.name;
  }
}
