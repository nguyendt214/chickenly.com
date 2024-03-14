import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { MainService } from '../../../main/main.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Category, CategoryService } from '../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';
import { Product, ProductService } from '../../../main/product.service';
import { UtilService } from '../../../main/util.service';

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
    private modelService: CustomerService,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private utilService: UtilService,
  ) {
  }

  ngOnInit() {
    this.getAllProductTypes();
    this.getAllCategories();
    this.getAllProducts();
    this.initPageData();
  }

  initPageData() {
    this.modelService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.all = this.allCustomers = all;
      this.source.load(this.all);
      this.utilService.loaded = true;
    });

  }

  getAllCategories() {
    if (this.categoryService.cacheCategory) {
      this.categories = this.categoryService.cacheCategory;
    } else {
      this.categoryService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.categories = all;
        this.categoryService.cacheCategory = all;
      });
    }
  }

  getAllProductTypes() {
    if (this.productTypeService.cacheProductTypes) {
      this.productTypes = this.productTypeService.cacheProductTypes;
    } else {
      this.productTypeService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.productTypes = this.productTypeService.cacheProductTypes = all;
      });
    }
  }

  getAllProducts() {
    if (this.productService.cacheProducts) {
      this.products = this.productService.cacheProducts;
      this.prepareProducts();

    } else {
      this.productService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.products = this.productService.cacheProducts = all;
        this.prepareProducts();
      });
    }
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
    this.modelService.create(e?.newData)
      .then(() => {
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    this.modelService.update(e?.newData?.key, e?.newData)
      .then(() => {
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.modelService.delete(e?.data?.key)
        .then(() => e.confirm.resolve())
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
    this.modelService.update(c.key, c);
  }

  setCurrentCustomer(c: Customer) {
    this.currenCustomerKey = c.key;
  }

  initFirstData() {
    this.allCustomers.forEach((c: Customer) => {
      this.products.forEach((p: Product) => {
        this.updateCustomerProduct(c, p, true);
      });
    });
  }
}
