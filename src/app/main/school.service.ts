import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from "./local-storage.servise";

export class School {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  customerKey?: any;
  owner?: any;
  disable?: boolean;
  printNumber?: number;
  showOrderPrice?: number;
  showQRCode?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private dbPath = '/School';
  cacheSchools: any;
  modelRef: AngularFireList<School>;
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<School> {
    return this.modelRef;
  }

  getAll2(): Observable<any> {
    if (this.cacheSchools) {
      return of(this.cacheSchools);
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
          ({...c, printNumber: c?.printNumber || 2}),
        ),
      ),
      map(changes =>
        changes.map(c =>
          ({...c, showOrderPrice: c?.showOrderPrice || 0}),
        ),
      ),
      map(changes =>
        changes.map(c =>
          ({...c, showQRCode: c?.showQRCode || 0}),
        ),
      ),
    );
  }

  storeData(data) {
    this.lc.setBool(this.lcKeyForce, false);
    this.lc.setObject(this.lcKey, data);
  }

  create(o: School): any {
    return this.modelRef.push(o);
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

  getSchoolByKey(o: School[], key: string) {
    const obj = o.filter((c: School) => c.key === key);
    if (obj?.length) {
      return obj.shift();
    }
  }
}
