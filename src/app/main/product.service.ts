import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

export class Product {
  key?: any;
  name?: string;
  price?: string;
  priceStock?: string;
  qty?: number;
  categoryKey?: string;
  productTypeKey?: string;
  note?: string;
  disable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private dbPath = '/Products';

  modelRef: AngularFireList<Product>;

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Product> {
    return this.modelRef;
  }

  create(o: Product): any {
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
