import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Cart, Order, OrderService } from '../../../../main/order.service';
import { Product, ProductService } from '../../../../main/product.service';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { LocalDataSource } from 'angular2-smart-table';
import { SmartTableData } from '../../../../@core/data/smart-table';
import { CustomerService } from '../../../../main/customer.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
  chiLinhKey = '-NiLEWbxAR_J42ncXqL0';
  qrcode = 'https://api.vietqr.io/image/970407-8521041985-1vjL582.jpg?accountName=DO%20TRONG%20NGUYEN';

  showPrice = false;
  showQRCode = false;
  constructor(
    public dialogRef: MatDialogRef<CartDialog>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private currencyPipe: CurrencyPipe,
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit() {
    this.order = this.data.order;
    console.log(this.order);
    this.orderDate = this.datePipe.transform(new Date(this.order.date), 'dd/MM/YYYY');
    this.qrcode += '&amount=' + this.calculatorOrderPrice(this.order);
    this.qrcode += '&addInfo=TTDH%20' + this.order.key;
    this.showPrice = this.order?.school?.showOrderPrice == 1;
    this.showQRCode = this.order?.school?.showQRCode == 1;
  }
  calculatorOrderPrice(o: Order) {
    let total = 0;
    if (!o) {
      return 0;
    }
    o.item.forEach((item: Cart) => {
      total += (item.qty - this.getQtyReturn(item.qtyReturn)) * item.price;
    });
    return total;
  }

  getQtyReturn(qtyReturn: any) {
    if (qtyReturn === '' || qtyReturn === ' ') {
      return 0;
    }
    return qtyReturn;
  }

  getTotalByItem(item: Cart) {
    return (item.qty - this.getQtyReturn(item.qtyReturn)) * item.price;
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
