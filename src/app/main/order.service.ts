import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Product } from './product.service';
import { UtilService } from './util.service';

export class Order {
  key?: any;
  name?: string;
  note?: string;
  disable?: boolean;
  date?: string;
  closeDate?: string;
  status?: string;
  item?: Cart[];
  employeeKey: any;
  customerKey: any;
  schoolKey: any;
}

export class Cart {
  qty?: number;
  price?: number;
  product?: Product;

  constructor(qty: number, price: number, p: Product) {
    this.qty = qty;
    this.price = price;
    this.product = p;
  }
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private dbPath = '/Order';

  modelRef: AngularFireList<Order>;

  constructor(
    private db: AngularFireDatabase,
    private utilService: UtilService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Order> {
    return this.modelRef;
  }

  create(o: Order): any {
    return this.modelRef.push(o);
  }

  update(key: string, value: any): Promise<void> {
    return this.modelRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.modelRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.modelRef.remove();
  }

  /**
   * Group item in cart by product->category
   * @param order
   */
  groupProductByCategory(order: Order): Order {
    order.item = Object.values(this.utilService.groupItemBy(order.item, 'product.categoryKey'));
    return order;
  }

  sortCartByCategory(order: Order): Order {
    order.item.sort((a, b) => a.product.categoryKey.localeCompare(b.product.categoryKey));
    return order;
  }
}
