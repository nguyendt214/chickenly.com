import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { Customer, CustomerService } from '../../../../main/customer.service';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { Product, ProductService } from '../../../../main/product.service';
import { UtilService } from '../../../../main/util.service';
import { ActivatedRoute } from '@angular/router';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-smart-table-product',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ProductPriceComponent implements OnInit {
  categories?: Category[] = [];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];
  allProducts?: Product[] = [];
  currentProduct?: Product;
  settings = {};

  source: LocalDataSource = new LocalDataSource();
  productId?: string;
  allCustomers: Customer[] = [];

  constructor(
    private service: SmartTableData,
    private modelService: ProductService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute,
    private toastrService: NbToastrService,
  ) {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.getAllCustomer();
    this.getAllCategories();
    this.getAllProductType();
    this.getAllProducts();
    this.utilService.loaded = true;
  }

  initPageData() {
    this.currentProduct = this.modelService.getProductByKey(this.allProducts, this.productId);
  }

  getAllProducts() {
    this.modelService.getAll3().subscribe(all => {
      this.all = all;
      this.all.forEach((product: Product) => {
        product.category = this.categories.find((c: Category) => c.key === product.categoryKey);
        product.productType = this.productTypes.find((pt: ProductType) => pt.key === product.productTypeKey);
      });
      this.allProducts = this.modelService.sortByCategory(this.all);
      this.initPageData();
    });
  }

  getAllCategories() {
    if (this.categoryService.cacheCategory) {
      this.categories = this.categoryService.cacheCategory;
    } else {
      this.categoryService.getAll3().subscribe(all => {
        this.categories = this.categoryService.cacheCategory = all;
      });
    }
  }

  getAllProductType() {
    if (this.productTypeService.cacheProductTypes) {
      this.productTypes = this.productTypeService.cacheProductTypes;
    } else {
      this.productTypeService.getAll3().subscribe(all => {
        this.productTypes = this.productTypeService.cacheProductTypes = all;
      });
    }
  }

  getAllCustomer() {
    if (this.customerService.cacheCustomers) {
      this.allCustomers = this.customerService.cacheCustomers;
    } else {
      this.customerService.getAll3().subscribe(all => {
        this.allCustomers = this.customerService.cacheCustomers = all;
      });
    }
  }

  updateTopProduct(p: Product, event: boolean) {
    p.topProduct = event;
    this.modelService.update(p.key, p);
  }

  onCustom(event) {
    if (event.action === 'customer-price') {
      this.utilService.gotoPage('pages/chicken/product/price-by-customer');
    }
  }

  getCustomerPrice(customerKey: string) {
    if (this.currentProduct) {
      if (this.currentProduct?.priceByUser) {
        return this.currentProduct?.priceByUser[customerKey] ?? this.currentProduct?.price;
      }
      return this.currentProduct?.price;
    }
    return 0;
    // return this.currentProduct ? (this.currentProduct.priceByUser[customerKey] ?? this.currentProduct.price) : 0;
  }

  submit(myForm) {
    this.currentProduct.priceByUser = myForm.form.value.inputs;
    this.modelService.update(this.productId, this.currentProduct)
      .then(() => {
        this.toastrService.show(
          '',
          `CẬP NHẬT GIÁ SẢN PHẨM THÀNH CÔNG`,
          {
            status: 'success',
            destroyByClick: true,
            duration: 4000,
            hasIcon: true,
            position: NbGlobalPhysicalPosition.BOTTOM_RIGHT,
            preventDuplicates: true,
          });
      });
  }

  back() {
    this.utilService.gotoPage('pages/chicken/product');
  }

}
