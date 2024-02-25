import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { FileUpload } from './upload.service';
import { Observable } from 'rxjs';
import { Customer } from './customer.service';

export class ThuChi {
  key?: any;
  name?: string;
  note?: string;
  thuChiTypeKey?: string;
  disable?: boolean;
  url?: string;
  date?: string;
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

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<ThuChi> {
    return this.modelRef;
  }

  getThuChiByKey(key: string): Observable<any> {
    return this.db.object(this.dbPath + '/' + key).valueChanges();
  }

  create(o: ThuChi): any {
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
