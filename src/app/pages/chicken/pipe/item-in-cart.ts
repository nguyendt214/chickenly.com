import { Pipe, PipeTransform } from '@angular/core';
import { Cart, Order } from '../../../main/order.service';
import { Product } from '../../../main/product.service';

@Pipe({name: 'itemInCart', pure: false})

export class ItemInCartPipe implements PipeTransform {
  transform(order: Order, product: Product) {
    if (!order.item) {
      return '';
    }
    return order.item.forEach((item: Cart) => {
      if (item.product.key === product.key) {
        return item.qty;
      }
    });
    return 0;
  }
}
