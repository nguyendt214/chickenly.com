import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

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
  cacheCategory: any;
  comKey = '-NiLGKc5UnUHjX1ERp71';
  comLyKey = '-NrK7K_JvaIKjTs3SaDZ';
  modelRef: AngularFireList<Category>;

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Category> {
    return this.modelRef;
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
