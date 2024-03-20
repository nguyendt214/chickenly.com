import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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

  constructor(private db: AngularFireDatabase) {
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
