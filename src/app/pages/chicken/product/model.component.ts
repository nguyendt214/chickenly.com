import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { Customer, CustomerService } from '../../../main/customer.service';
import { Category, CategoryService } from '../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';
import { Product, ProductService } from '../../../main/product.service';

@Component({
  selector: 'ngx-smart-table-product',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ProductComponent implements OnInit {
  categories?: Category[] = [];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];
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
        width: '25%',
      },
      category: {
        title: 'NHÓM',
        valuePrepareFunction: (cell) => {
          const c: Category = this.categoryService.getCategoryByKey(this.categories, cell);
          return c ? c.name : '';
        },
        editor: {
          type: 'list',
          config: {
            list: [],
          },
        },
        sort: true,
      },
      productType: {
        title: 'NHÓM',
        valuePrepareFunction: (cell) => {
          const c: ProductType = this.productTypeService.getProductTypeByKey(this.productTypes, cell);
          return c ? c.name : '';
        },
        editor: {
          type: 'list',
          config: {
            list: [],
          },
        },
      },
      phone: {
        title: 'Giá bán',
        type: 'string',
      },
      address: {
        title: 'Giá nhập',
        type: 'string',
      },
      qty: {
        title: 'Số lượng',
        type: 'string',
      },
      note: {
        title: 'Ghi Chú',
        type: 'string',
      },
    },
    pager: {
      perPage: 30
    }
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private modelService: ProductService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
  ) {
    this.modelService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()})
        )
      )
    ).subscribe(all => {
      this.all = all;
      this.source.load(this.all);
    });
  }

  ngOnInit() {
    this.getAllCategories();
    this.getAllProductType();
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

  getAllCategories() {
    this.categoryService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()})
        ),
      ),
    ).subscribe(all => {
      this.categories = all;
      this.categories.forEach((c: Category) => {
        this.settings.columns.category.editor.config.list.push({
          value: c.key,
          title: c.name,
        });
      });
      this.settings = Object.assign({}, this.settings);
    });
  }

  getAllProductType() {
    this.productTypeService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()})
        ),
      ),
    ).subscribe(all => {
      this.productTypes = all;
      this.productTypes.forEach((c: ProductType) => {
        this.settings.columns.productType.editor.config.list.push({
          value: c.key,
          title: c.name,
        });
      });
      this.settings = Object.assign({}, this.settings);
    });
  }

}
