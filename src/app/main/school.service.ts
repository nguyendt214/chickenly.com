import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

export class School {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  customerKey?: any;
  owner?: any;
  disable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private dbPath = '/School';
  cacheSchools: any;
  modelRef: AngularFireList<School>;

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<School> {
    return this.modelRef;
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
}
