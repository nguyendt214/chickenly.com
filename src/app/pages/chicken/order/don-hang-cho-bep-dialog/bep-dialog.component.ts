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
  cart: Cart[];
  dateStr: string;
}

@Component({
  selector: 'dialog-overview-example-dialog-bep',
  templateUrl: './dialog.html',
})
export class BepDialog implements OnInit {
  cart: Cart[] = [];
  dateStr: string;
  constructor(
    public dialogRef: MatDialogRef<BepDialog>,
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
    this.cart = this.data.cart;
    this.dateStr = this.data.dateStr;
  }

  printOrder() {
    window.print();
  }

}
