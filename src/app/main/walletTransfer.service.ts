import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { Product } from './product.service';
import { Wallet } from './wallet.service';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from "./local-storage.servise";

export class WalletTransfer {
  key?: any;
  fromWalletKey?: string;
  fromWallet?: Wallet | null;
  toWalletKey?: string;
  toWallet?: Wallet | null;
  soTien?: number;
  paymentType?: number;
  name?: string;
  note?: string;
  disable?: boolean;
  date?: string;
  dateLocale?: string;
  update?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletTransferService {
  private dbPath = '/WalletTransfer';
  cacheWalletTransfer: any;
  modelRef: AngularFireList<WalletTransfer>;
  viCtyKey = '-NrdSKUVeKHqFX4l9UKi';
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<WalletTransfer> {
    return this.modelRef;
  }
  getAll2(): Observable<any> {
    if (this.cacheWalletTransfer) {
      return of(this.cacheWalletTransfer);
    }
    return this.modelRef.valueChanges();
  }

  getAll3() {
    if (this.lc.getItem(this.lcKey) && !this.lc.getBool(this.lcKeyForce)) {
      return of(this.lc.getObject(this.lcKey));
    }
    return this.modelRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
      map(changes =>
        changes.map(c =>
          ({...c, note: c?.note || ''}),
        ),
      ),
    );
  }

  storeData(data) {
    this.lc.setBool(this.lcKeyForce, false);
    this.lc.setObject(this.lcKey, this.getLimitLocalStorageCache(data));
  }

  getLimitLocalStorageCache(data = [], number = 500) {
    return data.slice((data.length - number), data.length);
  }

  create(o: WalletTransfer): any {
    o.date = (new Date()).toISOString();
    o.dateLocale = new Date().toLocaleDateString();
    return this.modelRef.push(o);
  }

  update(key: string, value: any): Promise<void> {
    value.update = (new Date()).toISOString();
    value.date = (new Date(value?.date)).toISOString();
    value.dateLocale = new Date(value?.date).toLocaleDateString();
    console.log(value);
    return this.modelRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.modelRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.modelRef.remove();
  }
}
