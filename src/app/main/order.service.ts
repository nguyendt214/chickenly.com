import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Product } from './product.service';
import { Employee } from './employee.service';
import { Customer } from './customer.service';
import { School } from './school.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from "./local-storage.servise";

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
  printed?: boolean;
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
  orders?: Order[];
  orderKeys?: Array<string>;
  masterTotal?: number;
  paidTotal?: number;
  unpaidTotal?: number;
  note?: string;
}

export class CongNoBySchool {
  school?: School;
  total?: number;
  paid?: boolean;
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
  thuCongNoBySchool = null;
  thuCongNoByCustomer = null;
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(number?: number): AngularFireList<Order> {
    return this.modelRef;
    // if (number) {
    //   return this.db.list(this.dbPath, ref =>
    //     ref.limitToLast(number));
    // } else {
    //   return this.modelRef;
    // }
  }

  getAll2(): Observable<any> {
    if (this.cacheOrder) {
      return of(this.cacheOrder);
    }
    return this.modelRef.valueChanges();
  }

  getAll3() {
    if (this.lc.getItem(this.lcKey) === 'undefined') {
      this.lc.removeItem(this.lcKey);
    } else if (this.lc.getItem(this.lcKey) && !this.lc.getBool(this.lcKeyForce)) {
      const data = this.getLimitOrder(this.lc.getObject(this.lcKey));
      return of(data);
    }
    return this.modelRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    );
  }

  storeData(data) {
    this.lc.setBool(this.lcKeyForce, false);
    this.lc.setObject(this.lcKey, this.getLimitOrder(data));
  }

  getLimitOrder(data: any, number = 500) {
    if (data?.date) {
      return data?.orders?.slice((data.length - number), data.length) ?? [];
    } else {
      return data?.slice((data.length - number), data.length) ?? [];
    }
  }

  create(o: Order): any {
    o.date = (new Date()).toLocaleDateString();
    return this.modelRef.push(o);
  }

  update(key: string, value: any): Promise<void> {
    value.update = (new Date()).toLocaleDateString();
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

  getAllOrders(): Observable<any[]> {
    return this.modelRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    );
  }

  /**
   * Group item in cart by product->category
   * @param order
   */
  groupProductByCategory(order: Order): Order {
    order.item = Object.values(this.groupItemBy(order.item, 'product.categoryKey'));
    return order;
  }

  groupItemBy(array, property) {
    const hash = {}, props = property.split('.');
    for (let i = 0; i < array.length; i++) {
      const key = props.reduce(function (acc, prop) {
        return acc && acc[prop];
      }, array[i]);
      if (!hash[key]) hash[key] = [];
      hash[key].push(array[i]);
    }
    return hash;
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
