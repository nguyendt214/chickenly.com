import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { MainService } from '../../../main/main.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { map, take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Category, CategoryService } from '../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';
import { Product, ProductService } from '../../../main/product.service';
import { UtilService } from '../../../main/util.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ngx-smart-table-customer',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class CustomerComponent implements OnInit {
  all?: Customer[] = [];
  allCustomers?: Customer[] = [];
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  products: Product[] = [];
  currenCustomerKey: string;
  settings = {
    add: {
      confirmCreate: true,
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      confirmSave: true,
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      name: {
        title: 'Tên',
        type: 'string',
      },
      phone: {
        title: 'Số Điện Thoại',
        type: 'string',
      },
      address: {
        title: 'Địa chỉ',
        type: 'string',
      },
      note: {
        title: 'Ghi Chú',
        type: 'string',
      },
    },
    pager: {
      perPage: 50,
    },
    noDataMessage: 'Không thấy KHÁCH HÀNG nào!',
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private mainService: MainService,
    private customerService: CustomerService,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private utilService: UtilService,
  ) {
  }

  ngOnInit() {
    this.utilService.loaded = false;
    this.getAllInParallel();
  }

  getAllInParallel() {
    forkJoin([
      this.productTypeService.getAll3().pipe(take(1)),
      this.categoryService.getAll3().pipe(take(1)),
      this.productService.getAll3().pipe(take(1)),
      this.customerService.getAll3().pipe(take(1)),
    ]).subscribe(
      (all) => {
        this.productTypes = this.productTypeService.cacheProductTypes = all[0];
        this.productService.storeData(this.productTypes);
        this.categories = this.categoryService.cacheCategory = all[1];
        this.categoryService.storeData(this.categories);
        this.products = this.productService.cacheProducts = all[2];
        this.productService.storeData(this.products);
        this.prepareProducts();
        this.all = this.allCustomers = all[3];
        this.customerService.storeData(this.all);
        this.source.load(this.all);
      },
      () => {
      },
      () => this.utilService.loaded = true
    );
  }

  prepareProducts() {
    // Category
    this.products.forEach((p: Product) => {
      p.category = this.categories.find((c: Category) => c.key === p.categoryKey);
    });
    // Product Type
    this.products.forEach((p: Product) => {
      p.productType = this.productTypes.find((pt: ProductType) => pt.key === p.productTypeKey);
    });
    this.products = this.productService.sortByCategory(this.products);
  }

  onCreateConfirm(e: any) {
    const oCustomer = e?.newData;
    oCustomer.phone = oCustomer?.phone ?? '';
    oCustomer.address = oCustomer?.address ?? '';
    oCustomer.note = oCustomer?.note ?? '';
    this.customerService.create(e?.newData)
      .then(() => {
        this.utilService.clearCache([this.customerService.lcKey]);
        window.location.reload();
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    this.customerService.update(e?.newData?.key, e?.newData)
      .then(() => {
        this.utilService.clearCache([this.customerService.lcKey]);
        window.location.reload();
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.customerService.delete(e?.data?.key)
        .then(() => {
          this.utilService.clearCache([this.customerService.lcKey]);
          e.confirm.resolve();
        })
        .catch(() => e.confirm.reject());
    } else {
      e.confirm.reject();
    }
  }

  userHasProduct(c: Customer, p: Product) {
    return c.products && c.products.includes(p.key);
  }

  updateCustomerProduct(c: Customer, p: Product, checked: boolean) {
    c.products = c.products ?? [];
    if (checked) {
      c.products.push(p.key);
    } else {
      c.products = c.products.filter((val: string) => val !== p.key);
    }
    c.products = [...new Set(c.products)];
    this.customerService.update(c.key, c).then(
      () => this.utilService.clearCache([this.customerService.lcKey])
    );
  }

  setCurrentCustomer(c: Customer) {
    this.currenCustomerKey = c.key;
  }
}
