import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { FileUpload } from './upload.service';
import { Observable, of } from 'rxjs';
import { Customer } from './customer.service';
import { Wallet } from './wallet.service';
import { map } from 'rxjs/operators';
import { LocalStorageService } from "./local-storage.servise";

export class ThuChi {
  key?: any;
  name?: string;
  note?: string;
  thuChiTypeKey?: string;
  disable?: boolean;
  url?: string;
  date?: string;
  dateTimestamp?: number;
  updateAt?: string;
  files?: FileUpload[];
  fileKeys?: Array<string>;
  price?: number;
  nhaCungCapKey?: string;
  soLuong?: string;
  trangThaiTT?: number;
  trangThaiLabel?: string;
  customerKey?: string;
  customer?: Customer | null;
  orders?: Array<string>;
  ttLuong?: boolean | null;
  paymentType?: number;
  paymentTypeLabel?: string;
  walletKey?: string;
  wallet?: Wallet | null;
  updated?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThuChiService {
  private dbPath = '/ThuChi';
  cacheThuChi: any;
  modelRef: AngularFireList<ThuChi>;
  public filterStartDate: any;
  public filterEndDate: any;
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';
  lcKeyDate = this.lcKey + 'Date';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<ThuChi> {
    return this.modelRef;
  }
  getAll2(): Observable<any> {
    if (this.cacheThuChi) {
      return of(this.cacheThuChi);
    }
    return this.modelRef.valueChanges();
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

  getThuChiByKey(key: string): Observable<any> {
    return this.db.object(this.dbPath + '/' + key).valueChanges();
  }

  getLastData(date: any): Observable<any> {
    if (this.lc.getItem(this.lcKey) && !this.lc.getBool(this.lcKeyForce)) {
      const lcData: any = this.lc.getObject(this.lcKey);
      const lcDate: any = this.lc.getObject(this.lcKeyDate);
      if (lcDate?.startDate &&
        new Date(date?.startDate).getTime() >= new Date(lcDate?.startDate).getTime() &&
        new Date(date?.startDate).getTime() <= new Date(lcDate?.endDate).getTime()) {
        console.log('Use ThuChi Cache From: ' + lcDate?.startDate);
        return of(lcData);
      }
    }
    console.log('Get Thu Chi from: ' + date?.startDate + ', to: ' + date?.endDate);
    const startAtTimestamp = new Date(date?.startDate).getTime();
    return this.db.list(this.dbPath, ref =>
        // ref.limitToLast(1000)
        ref.orderByChild('dateTimestamp')
          .startAt(startAtTimestamp)
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
      const orderDate = (new Date((new Date(o?.date)).setHours(0, 0, 0, 0))).toLocaleDateString();
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

  create(o: ThuChi): any {
    o.dateTimestamp = new Date(o?.date).getTime();
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
      () => alert('Tạo thu chi lỗi, liên hệ ADMIN ngay!!! Cám ơn!')
    );
  }

  update(key: string, value: any): Promise<void> {
    value.updated = (new Date()).toLocaleDateString();
    this.lc.setBool(this.lcKeyForce, true);
    return this.modelRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    this.lc.setBool(this.lcKeyForce, true);
    return this.modelRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.modelRef.remove();
  }

  getCurrentMonth() {
    if (!this.filterStartDate) {
      const date = new Date();
      this.filterStartDate = new Date(date.getFullYear(), date.getMonth(), 1);
      this.filterEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    return [new Date(this.filterStartDate.setHours(0, 0, 0, 0)),
      new Date(this.filterEndDate.setHours(0, 0, 0, 0))];
  }
}
