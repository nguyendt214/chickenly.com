import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { Customer, CustomerService } from '../../../main/customer.service';
import { Category, CategoryService } from '../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';
import { Product, ProductService } from '../../../main/product.service';
import { UtilService } from '../../../main/util.service';

@Component({
  selector: 'ngx-smart-table-product',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ProductComponent implements OnInit {
  categories?: Category[] = [];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];
  allProducts?: Product[] = [];
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
      categoryKey: {
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
        sortDirection: 'desc',
      },
      productTypeKey: {
        title: 'QUI CÁCH',
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
      price: {
        title: 'Giá bán chung',
        type: 'number',
      },
      priceStock: {
        title: 'Giá nhập',
        type: 'number',
      },
      qty: {
        title: 'Số lượng',
        type: 'number',
      },
      note: {
        title: 'Ghi Chú',
        type: 'string',
      },
    },
    pager: {
      perPage: 50,
    },
    actions: {
      custom: [
        {
          name: 'customer-price',
          title: '<span class="custom-action">Sửa giá theo Đối Tác</span>',
        },
      ],
      columnTitle: '',
    },
    noDataMessage: 'Không thấy SẢN PHẨM nào!',
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private modelService: ProductService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    this.getAllCategories();
    this.getAllProductType();
    this.getAllProducts();
  }
  getAllProducts() {
    this.modelService.getAll3().subscribe(all => {
      this.all = all;
      this.modelService.storeData(all);
      this.all.forEach((product: Product) => {
        product.category = this.categories.find((c: Category) => c.key === product.categoryKey);
        product.productType = this.productTypes.find((pt: ProductType) => pt.key === product.productTypeKey);
      });
      this.source.load(this.all);
      this.allProducts = this.modelService.sortByCategory(this.all);
      this.utilService.loaded = true;
    });
  }

  onCreateConfirm(e: any) {
    const oProduct = e?.newData;
    oProduct.categoryKey = oProduct?.categoryKey ?? this.categories[0].key;
    oProduct.productTypeKey = oProduct?.productTypeKey ?? this.productTypes[0].key;
    oProduct.price = oProduct?.price ?? 0;
    oProduct.priceStock = oProduct?.priceStock ?? 0;
    oProduct.qty = oProduct?.qty ?? 0;
    oProduct.note = oProduct?.note ?? '';
    const p: Product = Object.assign({}, this.modelService.initProductBeforeSave(oProduct));
    this.modelService.create(p)
      .then(() => {
        this.utilService.clearCache([this.modelService.lcKey]);
        window.location.reload();
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    const p: Product = Object.assign({}, this.modelService.initProductBeforeSave(e?.newData));
    this.modelService.update(e?.newData?.key, p)
      .then(() => {
        this.utilService.clearCache([this.modelService.lcKey]);
        window.location.reload();
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.modelService.delete(e?.data?.key)
        .then(() => {
          this.utilService.clearCache([this.modelService.lcKey]);
          e.confirm.resolve();
        })
        .catch(() => e.confirm.reject());
    } else {
      e.confirm.reject();
    }
  }

  getAllCategories() {
    if (this.categoryService.cacheCategory) {
      this.categories = this.categoryService.cacheCategory;
      this.prepareCategory();
    } else {
      this.categoryService.getAll3().subscribe(all => {
        this.categories = this.categoryService.cacheCategory = all;
        this.prepareCategory();
      });
    }
  }

  prepareCategory() {
    this.categoryService.storeData(this.categories);
    this.categories.forEach((c: Category) => {
      this.settings.columns.categoryKey.editor.config.list.push({
        value: c.key,
        title: c.name,
      });
    });
    this.settings = Object.assign({}, this.settings);
  }

  getAllProductType() {
    if (this.productTypeService.cacheProductTypes) {
      this.productTypes = this.productTypeService.cacheProductTypes;
      this.prepareProductType();
    } else {
      this.productTypeService.getAll3().subscribe(all => {
        this.productTypes = this.productTypeService.cacheProductTypes = all;
        this.prepareProductType();
      });
    }
  }

  prepareProductType() {
    this.productTypeService.storeData(this.productTypes);
    this.productTypes.forEach((c: ProductType) => {
      this.settings.columns.productTypeKey.editor.config.list.push({
        value: c.key,
        title: c.name,
      });
    });
    this.settings = Object.assign({}, this.settings);
  }

  updateTopProduct(p: Product, event: boolean) {
    p.topProduct = event;
    this.modelService.update(p.key, p);
  }

  onCustom(event) {
    if (event.action === 'customer-price') {
      this.utilService.gotoPage('pages/chicken/product/price-by-customer/' + event.data.key);
    }
  }

}
