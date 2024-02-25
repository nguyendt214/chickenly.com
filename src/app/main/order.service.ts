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
  updated: string;
  paid?: boolean;
  orderKeys?: Array<string>;
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

export class CongNoByCustomer {
  customer?: Customer;
  schools?: CongNoBySchool[];
  masterTotal?: number;
  note?: string;
}

export class CongNoBySchool {
  school?: School;
  total?: number;
  note?: string;
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
  orderClone: Order;
  truyThuCongNo = null;

  constructor(
    private db: AngularFireDatabase,
    private utilService: UtilService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(number?: number): AngularFireList<Order> {
    if (number) {
      return this.db.list(this.dbPath, ref =>
        ref.limitToLast(number));
    } else {
      return this.modelRef;
    }
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

  getLastWeek(previous?: number) {
    previous = previous ?? 1;
    const dayBefore = previous * 7;
    const d = new Date();
    // set to Monday of this week
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);

    // set to previous Monday
    d.setDate(d.getDate() - dayBefore);
    this.filterStartDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    this.filterEndDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 5);
    return [new Date(this.filterStartDate.setHours(0, 0, 0, 0)),
      new Date(this.filterEndDate.setHours(0, 0, 0, 0))];
  }

  getLast2Weeks() {
    if (!this.filterStartDate) {
      const d = new Date();
      // set to Monday of this week
      d.setDate(d.getDate() - (d.getDay() + 6) % 7);

      // set to previous Monday
      d.setDate(d.getDate() - 14);
      this.filterStartDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      this.filterEndDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6);
    }
    return [new Date(this.filterStartDate.setHours(0, 0, 0, 0)),
      new Date(this.filterEndDate.setHours(0, 0, 0, 0))];
  }

  getCurrentWeek() {
    const today = new Date();
    const day = today.getDay(); // 👉️ get day of week

    // 👇️ day of month - day of week (-6 if Sunday), otherwise +1
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);

    this.filterStartDate = new Date(today.setDate(diff));
    this.filterEndDate = new Date(
      today.setDate(today.getDate() - today.getDay() + 6),
    );
    return [new Date(this.filterStartDate.setHours(0, 0, 0, 0)),
      new Date(this.filterEndDate.setHours(0, 0, 0, 0))];
  }
}
