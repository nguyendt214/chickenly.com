import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

export class NhaCungCap {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  disable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NhaCungCapService {
  private dbPath = '/NhaCungCap';
  cacheNhaCungCaps: any;
  modelRef: AngularFireList<NhaCungCap>;

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<NhaCungCap> {
    return this.modelRef;
  }

  create(tutorial: NhaCungCap): any {
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

  getNhaCungCapByKey(customers: NhaCungCap[], key: string) {
    if (customers) {
      const customer = customers.filter((c: NhaCungCap) => c.key === key);
      if (customer?.length) {
        const cus: NhaCungCap = customer.shift();
        return cus;
      }
    }
    return;
  }
}
