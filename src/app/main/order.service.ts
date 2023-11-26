import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Product } from './product.service';
import { UtilService } from './util.service';
import { Employee } from './employee.service';
import { Customer } from './customer.service';
import { School } from './school.service';
import { Observable } from 'rxjs';

export class Order {
  key?: any;
  name?: string;
  note?: string;
  disable?: boolean;
  date?: string;
  closeDate?: string;
  status?: string;
  item?: Cart[];
  employee: Employee;
  customer: Customer;
  school: School;
  sItem: any;
  master?: Order;
}

export class Cart {
  qty?: number;
  price?: number;
  product?: Product;
  categoryKey?: any;
  qtyReturn?: number;

  constructor(qty: number, price: number, p: Product, categoryKey: string, qtyReturn: number = 0) {
    this.qty = qty;
    this.price = price;
    this.product = p;
    this.categoryKey = categoryKey;
    this.qtyReturn = qtyReturn;
  }
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private dbPath = '/Order';
  public filterStartDate: any;
  public filterEndDate: any;
  modelRef: AngularFireList<Order>;
  cacheOrder: any;

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

  getOrderByKey(key: string): Observable<any> {
    return this.db.object(this.dbPath + '/' + key).valueChanges();
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

  sortByCategory(cart: Cart[]): Cart[] {
    cart.sort((a, b) => a.product.categoryKey.localeCompare(b.product.categoryKey));
    return cart;
  }

  removePropertiesBeforeSave(order: Order): Order {
    order.item.forEach((c: Cart) => {
      delete c['categoryName'];
      delete c['productName'];
      delete c['productType'];
      c.qty = +c.qty;
      c.price = +c.price;
      if (c.qtyReturn) {
        c.qtyReturn = +c.qtyReturn;
      }
    });
    return order;
  }

  getLast7Days() {
    if (!this.filterStartDate) {
      this.filterStartDate = new Date(new Date().setDate((new Date()).getDate() - 7));
      this.filterEndDate = new Date();
    }
    return [this.filterStartDate, this.filterEndDate];
  }
}
