import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { Product } from './product.service';
import { Wallet } from './wallet.service';
import { Observable, of } from 'rxjs';

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

  constructor(private db: AngularFireDatabase) {
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
