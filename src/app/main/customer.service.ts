import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { Product } from './product.service';

export class Customer {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  disable?: boolean;
  products?: Array<string>;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private dbPath = '/Customer';
  cacheCustomers: any;
  modelRef: AngularFireList<Customer>;

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Customer> {
    return this.modelRef;
  }

  create(tutorial: Customer): any {
    return this.modelRef.push(tutorial);
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

  getCustomerByKey(customers: Customer[], key: string) {
    const customer = customers.filter((c: Customer) => c.key === key);
    if (customer?.length) {
      const cus: Customer = customer.shift();
      return cus;
    }
  }
}
