import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { NhaCungCap } from './nhaCungCap.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from "./local-storage.servise";

export class ThuChiType {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  customerKey?: any;
  owner?: any;
  disable?: boolean;
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThuChiTypeService {
  private dbPath = '/ThuChiType';
  cacheThuChiType: any;
  modelRef: AngularFireList<ThuChiType>;
  thuChiType = [
    {
      key: 1,
      name: 'THU'
    },
    {
      key: 2,
      name: 'CHI'
    }
  ];
  thanhToanTypes = [
    {
      key: 1,
      name: 'Chưa Thanh Toán'
    },
    {
      key: 2,
      name: 'Đã Thanh Toán'
    }
  ];
  paymentTypes = [
    {
      key: 1,
      name: 'Chuyển khoản'
    },
    {
      key: 2,
      name: 'Tiền mặt'
    }
  ];
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
  ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<ThuChiType> {
    return this.modelRef;
  }
  getAll2(): Observable<any> {
    if (this.cacheThuChiType) {
      return of(this.cacheThuChiType);
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
    this.lc.setObject(this.lcKey, data);
  }

  create(o: ThuChiType): any {
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

  getThuChiTypeByKey(o: ThuChiType[], key: string) {
    if (o) {
      const temp = o.filter((c: ThuChiType) => c.key === key);
      if (temp?.length) {
        const cus: ThuChiType = temp.shift();
        return cus;
      }
    }
    return;
  }
}
