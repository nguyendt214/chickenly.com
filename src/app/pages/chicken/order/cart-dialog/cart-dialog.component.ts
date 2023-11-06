import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Cart, Order, OrderService } from '../../../../main/order.service';
import { Product, ProductService } from '../../../../main/product.service';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { LocalDataSource } from 'ng2-smart-table';
import { SmartTableData } from '../../../../@core/data/smart-table';
import { CustomerService } from '../../../../main/customer.service';
import { CurrencyPipe } from '@angular/common';
import { map } from 'rxjs/operators';

export interface DialogData {
  order: Order;
  products: Product[];
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './dialog.html',
})
export class CartDialog implements OnInit {
  categories?: Category[] = [];
  order: Order;
  products: Product[];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];

  settings = {
    actions: {
      add: false,
      edit: false,
      delete: false,
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
      hideSubHeader: true,
    },
  };
  source: LocalDataSource = new LocalDataSource();

  constructor(
    public dialogRef: MatDialogRef<CartDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,

    private service: SmartTableData,
    private modelService: ProductService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private orderService: OrderService,
    private currencyPipe: CurrencyPipe,

    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit() {
    this.order = this.data.order;
    this.products = this.data.products;
    this.getAllCategories();
    this.getAllProductType();
    this.initProducts();
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
