import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Cart, Order } from '../../../main/order.service';
import { School, SchoolService } from '../../../main/school.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { Product, ProductService } from '../../../main/product.service';
import { map } from 'rxjs/operators';
import { Category, CategoryService } from '../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';

@Component({
  selector: 'ngx-order',
  templateUrl: 'order.component.html',
  styleUrls: ['order.component.scss'],
})
export class OrderComponent implements OnInit {
  order: Order = new Order();
  schools: School[] = [];
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  products: Product[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  panelOpenState = false;
  firstForm: UntypedFormGroup;
  secondForm: UntypedFormGroup;
  thirdForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private ref: ChangeDetectorRef,
    private schoolService: SchoolService,
    private customerService: CustomerService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
  ) {
    this.getAllProductTypes();
    this.getAllCategories();
    this.getAllCustomer();
    this.getAllEmployee();
    this.getAllProducts();
    this.getAllSchools();
    this.order.item = [];
  }

  ngOnInit() {
    this.firstForm = this.fb.group({
      firstCtrl: ['', Validators.required],
    });

    this.secondForm = this.fb.group({
      secondCtrl: ['', Validators.required],
    });

    this.thirdForm = this.fb.group({
      thirdCtrl: ['', Validators.required],
    });
  }

  onFirstSubmit() {
    this.firstForm.markAsDirty();
  }

  onSecondSubmit() {
    this.secondForm.markAsDirty();
  }

  onThirdSubmit() {
    this.thirdForm.markAsDirty();
  }

  createDateChooice(t: string, e: any) {
    this.order.date = e.value;
  }

  getAllCategories() {
    this.categoryService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.categories = all;
    });
  }

  getAllProductTypes() {
    this.productTypeService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.productTypes = all;
    });
  }

  getAllProducts() {
    this.productService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.products = all;
      // Category
      this.products.forEach((p: Product) => {
        p.category = this.categories.find((c: Category) => c.key === p.categoryKey);
      });
      // Product Type
      this.products.forEach((p: Product) => {
        p.productType = this.productTypes.find((pt: ProductType) => pt.key === p.productTypeKey);
      });
      this.products = this.productService.groupProductByCategory(this.products);
      console.log(this.products);
    });
  }

  getAllCustomer() {
    this.customerService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.customers = all;
    });
  }

  getAllEmployee() {
    this.employeeService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.employees = all;
    });
  }

  getAllSchools() {
    this.schoolService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.schools = all;
    });
  }

  addToCart(p: Product) {
    // Find if product exists in cart
    const exists = this.order.item.filter((item: Cart) => item.product.key === p.key).length;
    if (exists) {
      this.order.item.forEach((item: Cart) => {
        if (item.product.key === p.key) {
          item.qty += 1;
        }
      });
    } else {
      this.order.item.push(new Cart(1, (p?.price ?? 0), p));
    }
    this.order = Object.assign({}, this.order);
  }

  itemInCart(p: Product) {
    let qty = 0;
    this.order.item.forEach((item: Cart) => {
      if (item.product.key === p.key) {
        qty = item.qty;
      }
    });
    return qty;
  }

  trackByFn(index, item) {
    return item.key;
  }
}
