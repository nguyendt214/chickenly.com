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
    );
  }

  storeData(data) {
    this.lc.setBool(this.lcKeyForce, false);
    this.lc.setObject(this.lcKey, this.getLimitOrder(data));
  }

  getLimitOrder(data = [], number = 500) {
    return data.slice((data.length - number), data.length);
  }

  create(tutorial: WalletTransfer): any {
    return this.modelRef.push(tutorial);
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
}
