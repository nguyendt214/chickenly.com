import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Category } from './category.service';
import { ProductType } from './product-type.service';

export class Product {
  key?: any;
  name?: string;
  price?: number;
  priceStock?: number;
  qty?: number;
  category?: Category | null;
  categoryKey?: string;
  productType?: ProductType | null;
  productTypeKey?: string;
  note?: string;
  disable?: boolean;
  cartPrice?: number;
  cartQty?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private dbPath = '/Products';
  cacheProducts: any;
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

  /**
   * Group product by Category
   * @param products
   */
  groupProductByCategory(products: Product[]) {
    const groupBy = (x, f) => x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});
    // Sort by category `order`
    products = groupBy(products, p => p.category.name);
    // products = Object.keys(products).map(key => products[key]);
    return products;
  }

  initProductBeforeSave(p: Product): Product {
    delete p['phone'];
    delete p['address'];
    p.qty = +p.qty;
    p.price = +p.price;
    p.priceStock = +p.priceStock;
    p.name = p.name.trim();
    return p;
  }
}