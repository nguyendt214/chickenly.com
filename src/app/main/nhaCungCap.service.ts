import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from "./local-storage.servise";

export class NhaCungCap {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  disable?: boolean;
  price?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NhaCungCapService {
  private dbPath = '/NhaCungCap';
  cacheNhaCungCaps: any;
  modelRef: AngularFireList<NhaCungCap>;
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<NhaCungCap> {
    return this.modelRef;
  }

  getAll2(): Observable<any> {
    if (this.cacheNhaCungCaps) {
      return of(this.cacheNhaCungCaps);
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
      map(ncc =>
        ncc.map(c =>
          ({...c, price: +c.price || 0}),
        ),
      ),
    );
  }

  storeData(data) {
    this.lc.setBool(this.lcKeyForce, false);
    this.lc.setObject(this.lcKey, data);
  }

  getLastData(): Observable<any> {
    return this.db.list(this.dbPath, ref =>
      ref.orderByChild('name')
        .limitToLast(500))
      .valueChanges();
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

  getNhaCungCapByKey(nccs: NhaCungCap[], key: string) {
    if (nccs) {
      const ncc = nccs.filter((c: NhaCungCap) => c.key === key);
      if (ncc?.length) {
        const cus: NhaCungCap = ncc.shift();
        return cus;
      }
    }
    return;
  }
}
