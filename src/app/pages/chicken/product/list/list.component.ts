import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { CustomerService } from '../../../../main/customer.service';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { Product, ProductService } from '../../../../main/product.service';
import { Cart, Order, OrderService } from '../../../../main/order.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ProductListComponent implements OnInit, OnChanges {
  @Input() products: Product[] = [];
  @Input() order: Order;
  @Input() editOrder = false;

  categories?: Category[] = [];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];

  settings = {
    actions: {
      add: false,
      columnTitle: 'Tác vụ',
      delete: false,
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
      categoryName: {
        title: 'Nhóm Sản Phẩm',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.product.category.name;
        },
        editable: false,
      },
      productName: {
        title: 'Sản Phẩm',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.product.name;
        },
        editable: false,
      },
      productType: {
        title: 'Qui cách',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<span class="text-center d-block">' + row.product.productType.name + '</span>';
        },
        editable: false,
      },
      qty: {
        title: 'Số Lượng Giao',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<span class="text-center d-block">' + row.qty + '</span>';
        },
        editable: true,
      },
      qtyReturn: {
        title: 'Số Lượng Trả',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          if (row.qtyReturn) {
            return '<span class="text-center d-block">' + row.qtyReturn + '</span>';
          }
        },
      },
      price: {
        title: 'Giá',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return this.currencyPipe.transform(row.price, '', '', '1.0-0') + ' VNĐ';
        },
        editable: true,
      },
      note: {
        title: 'Ghi Chú',
        type: 'string',
      },
    },
    hideSubHeader: false,
  };
  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private modelService: ProductService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private orderService: OrderService,
    private currencyPipe: CurrencyPipe,
  ) {
  }

  ngOnInit() {
    this.getAllCategories();
    this.getAllProductType();
    this.initTable();
  }

  initTable() {
    if (this.editOrder) {
      this.settings.columns.qty.editable = false;
      this.settings.columns.price.editable = false;
    } else {
      delete this.settings.columns.qtyReturn;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initProducts();
  }

  onEditConfirm(e: any) {
    this.order.item.forEach((item: Cart) => {
      if (item.product.key === e.newData.product.key) {
        item.qty = +e.newData.qty;
        item.price = e.newData.price;
        e.confirm.resolve();
      }
    });
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.order.item.filter((item: Cart) => item.product.key !== e.data.product.key);
      e.confirm.resolve();
    } else {
      e.confirm.reject();
    }
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

  getAllProductType() {
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

  initProducts() {
    if (this.order.item && this.order.item.length) {
      this.order = this.orderService.sortCartByCategory(this.order);
      this.source.load(this.order.item);
    }
  }
}
