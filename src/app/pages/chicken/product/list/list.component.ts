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

  categories?: Category[] = [];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];

  settings = {
    actions: {
      add: false,
      columnTitle: 'Tác vụ',
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
      'product.category': {
        title: 'Nhóm Sản Phẩm',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.product.category.name;
        },
        editable: false,
      },
      'product.name': {
        title: 'Sản Phẩm',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.product.name;
        },
        editable: false,
      },
      'product.productType': {
        title: 'Qui cách',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.product.productType.name;
        },
        editable: false,
      },
      qty: {
        title: 'Số Lượng Giao',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.qty;
        },
      },
      price: {
        title: 'Giá',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return this.currencyPipe.transform(row.price, '', '', '1.0-0');
        },
      },
      note: {
        title: 'Ghi Chú',
        type: 'string',
      },
    },
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
    console.log(this.order.item);
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
    this.categoryService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.categories = all;
    });
  }

  getAllProductType() {
    this.productTypeService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.productTypes = all;
    });
  }

  initProducts() {
    if (this.order.item && this.order.item.length) {
      this.order = this.orderService.sortCartByCategory(this.order);
      this.source.load(this.order.item);
    }
  }

}
