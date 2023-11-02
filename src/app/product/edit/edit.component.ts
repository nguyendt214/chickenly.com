import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Category, Product, ProductType } from '../../main/main.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  model: Product = new Product();
  key: string | any;

  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    protected activeRoute: ActivatedRoute,
  ) {
    this.getListCategory();
    this.key = this.activeRoute.snapshot.paramMap.get('key');
    this.mainService.kDetail(this.key, this.mainService.mO.product).subscribe(
      (data: any) => {
        this.model = data;
      }
    );
  }

  edit() {
    this.mainService.kUpdate(this.key, this.model, this.mainService.mO.product).then(
      () => this.utilService.gotoPage('product')
    );
  }

  getListCategory() {
    this.mainService.retrieveData(this.mainService.mO.category).subscribe(
      (data: any) => {
        this.categories = data;
      }
    );
    this.mainService.retrieveData(this.mainService.mO.productType).subscribe(
      (data: any) => {
        this.productTypes = data;
      }
    );
  }
}
