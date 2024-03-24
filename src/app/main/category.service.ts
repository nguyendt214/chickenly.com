import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from "./local-storage.servise";

export class Category {
  key?: any;
  name?: string;
  order?: number;
  note?: string;
  disable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private dbPath = '/Category';
  cacheCategory: Category[];
  comKey = '-NiLGKc5UnUHjX1ERp71';
  comLyKey = '-NrK7K_JvaIKjTs3SaDZ';
  modelRef: AngularFireList<Category>;
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';

  constructor(
    private db: AngularFireDatabase,
    private lc: LocalStorageService,
              ) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Category> {
    return this.modelRef;
  }
  getAll2(): Observable<any> {
    if (this.cacheCategory) {
      return of(this.cacheCategory);
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

  create(o: Category): any {
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

  getCategoryByKey(list: Category[], key: string) {
    const item = list.filter((c: Category) => c.key === key);
    if (item?.length) {
      const o: Category = item.shift();
      return o;
    }
  }
}
