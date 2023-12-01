import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Cart, Order, OrderService } from '../../../../main/order.service';
import { Product } from '../../../../main/product.service';
import { Category } from '../../../../main/category.service';
import { ProductType } from '../../../../main/product-type.service';
import { UtilService } from '../../../../main/util.service';
import { NbToastrService } from '@nebular/theme';
import { ActivatedRoute } from '@angular/router';

export interface OrderItemDialog {
  order: Order;
  product: Product;
  products: Product[];
  categories: Category[];
  productTypes: ProductType[];
  cart: Cart;
  orderKey: string;
}

@Component({
  selector: 'dialog-overview-example-dialog-cart-item',
  templateUrl: './dialog.html',
})
export class OrderItemDialog implements OnInit {
  order: Order;
  products: Product[];
  all?: Product[] = [];
  productTypes: ProductType[];
  orderDate: string;
  cart: Cart;
  toaConfig = {};
  orderKey = '';
  qty: number = 0;
  qtyReturn: number = 0;
  price: number = 0;
  note: string = '';

  constructor(
    public dialogRef: MatDialogRef<OrderItemDialog>,
    @Inject(MAT_DIALOG_DATA) public data: OrderItemDialog,
    private orderService: OrderService,
    private utilService: UtilService,
    private toastrService: NbToastrService,
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close({order: this.order});
  }


  ngOnInit() {
    this.order = this.data.order;
    this.orderKey = this.data.orderKey;
    this.cart = this.data.cart;
    this.qty = this.cart.qty;
    this.qtyReturn = this.cart.qtyReturn ?? 0;
    this.price = this.cart.price;
    this.note = this.cart.product.note;
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

  cancel() {
    this.onNoClick();
  }

  toastrConfig() {
    this.toaConfig = {
      status: 'success',
      destroyByClick: true,
      duration: 3000,
      hasIcon: true,
      position: 'bottom-right',
      preventDuplicates: true,
    };
  }

  showToa() {
    this.toastrConfig();
    this.toastrService.show(
      `SP: ${this.cart.product.name}`,
      `CẬP NHẬT SẢN PHẨM VÀ ĐƠN HÀNG THÀNH CÔNG`,
      this.toaConfig);
  }

  submit() {
    this.onNoClick();
    this.order = this.orderService.removePropertiesBeforeSave(this.order);
    this.order.updated = (new Date()).toLocaleDateString();
    this.order.item.forEach((cart: Cart) => {
      if (cart.product.key === this.cart.product.key) {
        cart.qty = +this.qty;
        cart.qtyReturn = +(this.qtyReturn ?? 0);
        cart.price = +this.price;
        cart.product.note = this.note;
      }
    });
    if (this.orderKey) {
      this.orderService.update(this.orderKey, this.order).then(
        () => {
          this.showToa();
          // Clear order cache
          this.orderService.cacheOrder = null;
        },
      );
    }
  }

  selectProductType(prt: ProductType) {
    this.order.item.forEach((cart: Cart) => {
      if (cart.product.key === this.cart.product.key) {
        cart.product.productTypeKey = prt.key;
        cart.product.productType = prt;
      }
    });
  }

}
