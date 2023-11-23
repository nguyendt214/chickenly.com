import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

export class ProductType {
  key?: any;
  name?: string;
  note?: string;
  disable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductTypeService {
  private dbPath = '/ProductType';
  cacheProductTypes: any;
  modelRef: AngularFireList<ProductType>;

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<ProductType> {
    return this.modelRef;
  }

  create(o: ProductType): any {
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

  getProductTypeByKey(list: ProductType[], key: string) {
    const item = list.filter((c: ProductType) => c.key === key);
    if (item?.length) {
      const o: ProductType = item.shift();
      return o;
    }
  }
}
