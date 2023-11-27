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
  orderDate: string;

  constructor(
    public dialogRef: MatDialogRef<CartDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit() {
    this.order = this.data.order;
    this.orderDate = (new Date(this.order?.date ?? '')).toLocaleDateString();
  }

  printOrder() {
    window.print();
    this.onNoClick();
  }

  getReturnByProductKey(productKey: string) {
    let qtyReturn: any = '';
    this.order.item.forEach((c: Cart) => {
      if (c.product.key === productKey) {
        qtyReturn = c.qtyReturn;
      }
    });
    return qtyReturn === 0 ? ' ' : qtyReturn;
  }

}