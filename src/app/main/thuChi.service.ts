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
    if (data?.date) {
      return data?.thuChi?.slice((data.length - number), data.length) ?? [];
    } else {
      return data?.slice((data.length - number), data.length) ?? [];
    }
  }

  getThuChiByKey(key: string): Observable<any> {
    return this.db.object(this.dbPath + '/' + key).valueChanges();
  }

  create(o: ThuChi): any {
    o.date = (new Date()).toLocaleDateString();
    return this.modelRef.push(o);
  }

  update(key: string, value: any): Promise<void> {
    value.updateAt = (new Date()).toLocaleDateString();
    return this.modelRef.update(key, value);
  }

  delete(key: string): Promise<void> {
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
