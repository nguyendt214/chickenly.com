import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Category, Customer, Product, ProductType, School } from './main.model';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private dbPath = '/tutorials';
  private dbCustomers = '/customers';
  private dbSchools = '/schools';
  private dbCategories = '/category';
  private dbProductsTypes = '/product-type';
  private dbProducts = '/products';
  customers: Customer[] = [];

  public mO = {
    customer: 'customer',
    school: 'school',
    category: 'category',
    productType: 'productType',
    product: 'product',
  };

  customerRef:  AngularFireList<Customer>;
  schoolsRef:  AngularFireList<School>;
  categoryRef:  AngularFireList<Product>;
  productTypeRef:  AngularFireList<ProductType>;
  productRef:  AngularFireList<Product>;
  private customers$ = new Subject<any>();
  public customersChange = this.customers$.asObservable();

  constructor(private db: AngularFireDatabase) {
    this.customerRef = db.list(this.dbCustomers);
    this.schoolsRef = db.list(this.dbSchools);
    this.categoryRef = db.list(this.dbCategories);
    this.productTypeRef = db.list(this.dbProductsTypes);
    this.productRef = db.list(this.dbProducts);
  }
  //
  // getAll(): AngularFireList<Tutorial> {
  //   return this.tutorialsRef;
  // }
  //
  // create(tutorial: Tutorial): any {
  //   return this.tutorialsRef.push(tutorial);
  // }
  //
  // update(key: string, value: any): Promise<void> {
  //   return this.tutorialsRef.update(key, value);
  // }
  //
  // delete(key: string): Promise<void> {
  //   return this.tutorialsRef.remove(key);
  // }
  //
  // deleteAll(): Promise<void> {
  //   return this.tutorialsRef.remove();
  // }
  /*
  ADD new
   */
  kAdd(o: any, type: string): any {
    switch (type) {
      case this.mO.customer:
        return this.customerRef.push(o);
      case this.mO.school:
        return this.schoolsRef.push(o);
      case this.mO.category:
        return this.categoryRef.push(o);
      case this.mO.productType:
        return this.productTypeRef.push(o);
      case this.mO.product:
        return this.productRef.push(o);
      default:
        return false;
    }
  }

  kDelete(o: any, type: string = ''): Promise<void> {
    if (o instanceof Customer || type === this.mO.customer) {
      return this.customerRef.remove(o?.key);
    }
    if (o instanceof School || type === this.mO.school) {
      return this.schoolsRef.remove(o?.key);
    }
    if (o instanceof Category || type === this.mO.category) {
      return this.categoryRef.remove(o?.key);
    }
    if (o instanceof Product || type === this.mO.productType) {
      return this.productTypeRef.remove(o?.key);
    }
    if (o instanceof Product || type === this.mO.product) {
      return this.productRef.remove(o?.key);
    }
    return (new Promise(null));
  }
  /*
  GET LIST ALL
   */
  getList(type?: any): AngularFireList<any> {
    switch (type) {
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
          ({ key: c.payload.key, ...c.payload.val() }),
        ),
      ),
    );
  }

  kDetail(key: string, type: string): Observable<any> {
    if (type === this.mO.customer) {
      return this.db.object(this.dbCustomers + '/' + key).valueChanges();
    }
    if (type === this.mO.school) {
      return this.db.object(this.dbSchools + '/' + key).valueChanges();
    }
    if (type === this.mO.category) {
      return this.db.object(this.dbCategories + '/' + key).valueChanges();
    }
    if (type === this.mO.product) {
      return this.db.object(this.dbProducts + '/' + key).valueChanges();
    }
    if (type === this.mO.productType) {
      return this.db.object(this.dbProductsTypes + '/' + key).valueChanges();
    }
    return this.db.object(this.dbPath + '/' + key).valueChanges();
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
    return this.customerRef.update(key, value);
  }

  getCustomers() {
    return this.getList(this.mO.customer).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val() }),
        ),
      ),
    ).subscribe(
      customers => {
        this.customers = customers;
        this.customers$.next(customers);
      }
    );
  }
}
