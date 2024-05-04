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
  dateLocale?: string;
  dateTimestamp?: number;
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
  printed1?: boolean;
  clone?: string;
  thuLevel?: number;
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
  lcKeyDate = this.lcKey + 'Date';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll3() {
    if (this.lc.getItem(this.lcKey) === 'undefined') {
      this.lc.removeItem(this.lcKey);
    } else if (this.lc.getItem(this.lcKey) && !this.lc.getBool(this.lcKeyForce)) {
      const data = this.getLimitLocalStorageCache(this.lc.getObject(this.lcKey));
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
    this.lc.setObject(this.lcKey, this.getLimitLocalStorageCache(data));
  }

  getLimitLocalStorageCache(data: any, number = 500) {
    data = this.sortListByDate(data);
    return data?.slice((data.length - number), data.length) ?? [];
  }

  sortListByDate(list: Array<any>) {
    return list.sort((a: any, b: any) => {
      return a.dateTimestamp - b.dateTimestamp;
    });
  }

  getLastData(date: any): Observable<any> {
    if (this.lc.getItem(this.lcKey) && !this.lc.getBool(this.lcKeyForce)) {
      const lcData: any = this.lc.getObject(this.lcKey);
      const lcDate: any = this.lc.getObject(this.lcKeyDate);
      console.log('Date filter', date);
      if (lcDate?.startDate &&
        new Date(date?.startDate).getTime() >= new Date(lcDate?.startDate).getTime() &&
        new Date(date?.startDate).getTime() <= new Date(lcDate?.endDate).getTime()) {
        console.log('Use Order Cache From: ' + lcDate?.startDate + ', to: ' + date?.endDate);
        return of(lcData);
      }
    }
    console.log('Get orders from: ' + date?.startDate + ', to: ' + date?.endDate);
    const startAtTimestamp = new Date(date?.startDate).getTime();
    return this.db.list(this.dbPath, ref =>
        // ref.limitToLast(1000)
        ref.orderByChild('dateTimestamp')
          .startAt(startAtTimestamp)
      // .limitToLast(200)
      // .endAt((new Date(endDate).toISOString()))
    ).valueChanges();
  }

  getDataFromCache() {
    return this.lc.getObject(this.lcKey) ?? [];
  }

  storeCacheData(data: any = [], date: any = {}) {
    // const oldDate = this.lc.getObject(this.lcKeyDate);
    // if (oldDate) {
    //   date.startDate = (oldDate['startDate'] <= date.startDate) ? oldDate['startDate'] : date?.startDate;
    //   date.endDate = (oldDate['endDate'] >= date.endDate) ? oldDate['endDate'] : date?.endDate;
    // }
    // // Merge data
    // const oldData = this.lc.getObject(this.lcKey);
    // if (oldData) {
    //   data = [...oldData, ...data];
    //   data = this.getUniqueListBy(data, 'key');
    // }

    data = data.filter((o: any) => {
      const orderDate = (new Date((new Date(o?.date)).setHours(0, 0, 0, 0))).toISOString();
      return date?.startDate <= orderDate;
      // return dates?.startDate <= orderDate && orderDate <= dates?.endDate;
    });
    this.lc.setBool(this.lcKeyForce, false);
    this.lc.setObject(this.lcKey, this.getLimitLocalStorageCache(data));
    this.lc.setObject(this.lcKeyDate, date);
  }

  getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()];
  }

  getLastItemKey() {
    return this.db.database.ref(this.dbPath).orderByKey().limitToLast(1)
      .on('child_added', (snapshot) => snapshot.key);
  }

  create(o: Order): any {
    o.dateTimestamp = new Date(o?.date).getTime();
    o.dateLocale = new Date(o?.date).toLocaleDateString();
    return this.modelRef.push(o).then(
      () => {
        const order = Object.assign({}, o);
        this.lc.setBool(this.lcKeyForce, true);
        // Get last record then update KEY
        this.db.database.ref(this.dbPath).orderByKey().limitToLast(1)
          .on('child_added', (snapshot) => {
            order.key = snapshot.key;
            this.update(snapshot.key, order).then(
              () => console.log('Create done', order)
            );
          });
      }
    ).catch(
      () => alert('Tạo đơn hàng lỗi, liên hệ ADMIN ngay!!! Cám ơn!')
    );
  }

  update(key: string, value: any): Promise<void> {
    value.updated = (new Date()).toISOString();
    this.lc.setBool(this.lcKeyForce, true);
    return this.modelRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    this.lc.setBool(this.lcKeyForce, true);
    return this.modelRef.remove(key);
  }

  getOrderByKey(key: string): Observable<any> {
    return this.db.object(this.dbPath + '/' + key).valueChanges();
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

  getOrderByKeyKevin(key: string) {
    const orders = this.getDataFromCache();
    const obj = orders.filter((c: Product) => c.key === key);
    if (obj?.length) {
      return obj.shift();
    }
    return null;
  }
}
