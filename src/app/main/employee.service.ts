import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export class Employee {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  disable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private dbPath = '/Employee';
  cacheEmployees: any;
  modelRef: AngularFireList<Employee>;

  constructor(private db: AngularFireDatabase) {
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Employee> {
    return this.modelRef;
  }

  getAllEmployees() : Observable<any[]> {
    return this.modelRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    );
  }
  getAll2(): Observable<any> {
    if (this.cacheEmployees) {
      return of(this.cacheEmployees);
    }
    return this.modelRef.valueChanges();
  }

  create(tutorial: Employee): any {
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

  getEmployeeByKey(o: Employee[], key: string) {
    const e = o.filter((c: Employee) => c.key === key);
    if (o?.length) {
      const item: Employee = e.shift();
      return item;
    }
  }
}
