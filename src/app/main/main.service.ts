import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Tutorial } from '../models/tutorial.model';
import { Category, Customer, Product, ProductType, School } from './main.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private dbPath = '/tutorials';
  private dbCustomers = '/customers';
  private dbSchools = '/schools';
  private dbCategories = '/category';
  private dbProductsTypes = '/product-type';
  private dbProducts = '/products';

  public mO = {
    customer: 'customer',
    school: 'school',
    category: 'category',
    productType: 'productType',
    product: 'product'
  };

  tutorialsRef: AngularFireList<Tutorial>;
  customerRef:  AngularFireList<Customer>;
  schoolsRef:  AngularFireList<School>;
  categoryRef:  AngularFireList<Product>;
  productTypeRef:  AngularFireList<ProductType>;
  productRef:  AngularFireList<Product>;

  constructor(private db: AngularFireDatabase) {
    this.tutorialsRef = db.list(this.dbPath);
    this.customerRef = db.list(this.dbCustomers);
    this.schoolsRef = db.list(this.dbSchools);
    this.categoryRef = db.list(this.dbCategories);
    this.productTypeRef = db.list(this.dbProductsTypes);
    this.productRef = db.list(this.dbProducts);
  }

  getAll(): AngularFireList<Tutorial> {
    return this.tutorialsRef;
  }

  create(tutorial: Tutorial): any {
    return this.tutorialsRef.push(tutorial);
  }

  update(key: string, value: any): Promise<void> {
    return this.tutorialsRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.tutorialsRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.tutorialsRef.remove();
  }
  /*
  ADD new
   */
  addNew(type: any): any {
    if (type instanceof Customer) {
      return this.customerRef.push(type);
    }
    if (type instanceof School) {
      return this.schoolsRef.push(type);
    }
    if (type instanceof Category) {
      return this.categoryRef.push(type);
    }
    if (type instanceof ProductType) {
      return this.productTypeRef.push(type);
    }
    if (type instanceof Product) {
      return this.productRef.push(type);
    }
  }

  kDelete(type: any, d: string = ''): Promise<void> {
    if (type instanceof Customer || d === this.mO.customer) {
      return this.customerRef.remove(type?.key);
    }
    if (type instanceof School || d === this.mO.school) {
      return this.schoolsRef.remove(type?.key);
    }
    if (type instanceof Category || d === this.mO.category) {
      return this.categoryRef.remove(type?.key);
    }
    if (type instanceof Product || d === this.mO.productType) {
      return this.productTypeRef.remove(type?.key);
    }
    if (type instanceof Product || d === this.mO.product) {
      return this.productRef.remove(type?.key);
    }
    return this.tutorialsRef.remove(type?.key);
  }
  /*
  GET LIST ALL
   */
  getList(type: any): AngularFireList<any> {
    switch (type){
      case this.mO.customer:
        return this.customerRef;
      case this.mO.school:
        return this.schoolsRef;
      case this.mO.category:
        return this.categoryRef;
      case this.mO.productType:
        return this.productTypeRef;
      case this.mO.product:
        return this.productRef;
      default:
        return this.customerRef;
    }
  }

  retrieveData(type: string): any {
    return this.getList(type).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val() })
        )
      )
    );
  }

  kDetail(key: string, type: string): Observable<any> {
    if (type === this.mO.customer) {
      return this.db.object(this.dbCustomers +'/' + key).valueChanges();
    }
    if (type === this.mO.school) {
      return this.db.object(this.dbSchools +'/' + key).valueChanges();
    }
    if (type === this.mO.category) {
      return this.db.object(this.dbCategories +'/' + key).valueChanges();
    }
    if (type === this.mO.product) {
      return this.db.object(this.dbProducts +'/' + key).valueChanges();
    }
    if (type === this.mO.productType) {
      return this.db.object(this.dbProductsTypes +'/' + key).valueChanges();
    }
    return this.db.object(this.dbPath +'/' + key).valueChanges();
  }

  kUpdate(key: string, value: any, type: string): Promise<void> {
    if (type === this.mO.customer) {
      return this.customerRef.update(key, value);
    }
    if (type === this.mO.school) {
      return this.schoolsRef.update(key, value);
    }
    if (type === this.mO.category) {
      return this.categoryRef.update(key, value);
    }
    if (type === this.mO.productType) {
      return this.productTypeRef.update(key, value);
    }
    if (type === this.mO.product) {
      return this.productRef.update(key, value);
    }
    return this.tutorialsRef.update(key, value);
  }
}
