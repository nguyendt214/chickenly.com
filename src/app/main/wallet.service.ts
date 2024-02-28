import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { Product } from './product.service';

export class Wallet {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  disable?: boolean;
  chiTotal?: number;
  thuTotal?: number;
  bankTotal?: number;
  cashTotal?: number;
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private dbPath = '/Wallet';
  cacheWallets: any;
  modelRef: AngularFireList<Wallet>;
  viCtyKey = '-NrdSKUVeKHqFX4l9UKi';

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Wallet> {
    return this.modelRef;
  }

  create(tutorial: Wallet): any {
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

  getWalletByKey(o: Wallet[], key: string) {
    const obj = o.filter((c: Wallet) => c.key === key);
    if (obj?.length) {
      return obj.shift();
    }
  }
}
