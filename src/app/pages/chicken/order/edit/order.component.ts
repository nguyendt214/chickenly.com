import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Cart, Order, OrderService } from '../../../../main/order.service';
import { School, SchoolService } from '../../../../main/school.service';
import { Customer, CustomerService } from '../../../../main/customer.service';
import { Employee, EmployeeService } from '../../../../main/employee.service';
import { Product, ProductService } from '../../../../main/product.service';
import { map } from 'rxjs/operators';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { MatDialog } from '@angular/material/dialog';
import { CartDialog } from '../cart-dialog/cart-dialog.component';
import { UtilService } from '../../../../main/util.service';
import { NbToastrService } from '@nebular/theme';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-order-edit',
  templateUrl: 'order.component.html',
})
export class EditOrderComponent implements OnInit {
  order: Order = new Order();
  orderId: string;
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
  enableTaoDonHang = false;
  today = new Date();
  toaConfig = {};

  constructor(
    private fb: UntypedFormBuilder,
    private ref: ChangeDetectorRef,
    private orderService: OrderService,
    private schoolService: SchoolService,
    private customerService: CustomerService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private dialog: MatDialog,
    private utilService: UtilService,
    private toastrService: NbToastrService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.orderId = this.activatedRoute.snapshot.paramMap.get('orderId');
    this.getAllCategories();
    this.getAllCustomer();
    this.getAllEmployee();
    this.getAllSchools();
    this.getOrderDetail();
    this.toastrConfig();
  }

  ngOnInit() {
  }

  getOrderDetail() {
    this.orderService.getOrderByKey(this.orderId)
      .subscribe(order => this.order = order);
  }

  toastrConfig() {
    this.toaConfig = {
      status: 'success',
      destroyByClick: true,
      duration: 3000,
      hasIcon: true,
      position: 'bottom-right',
      preventDuplicates: true,
    };
  }

  showToa() {
    this.toastrService.show(
      'Tự động quay trở lại danh sách đơn hàng sau 5 giây',
      `CẬP NHẬT ĐƠN HÀNG THÀNH CÔNG`,
      this.toaConfig);
  }

  getAllCategories() {
    if (this.categoryService.cacheCategory) {
      this.categories = this.categoryService.cacheCategory;
    } else {
      this.categoryService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.categories = all;
        this.categoryService.cacheCategory = all;
      });
    }
  }

  getAllProductTypes() {
    if (this.productTypeService.cacheProductTypes) {
      this.productTypes = this.productTypeService.cacheProductTypes;
    } else {
      this.productTypeService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.productTypes = this.productTypeService.cacheProductTypes = all;
      });
    }
  }

  getAllCustomer() {
    if (this.customerService.cacheCustomers) {
      this.customers = this.customerService.cacheCustomers;
    } else {
      this.customerService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.customers = this.customerService.cacheCustomers = all;
      });
    }
  }

  getAllEmployee() {
    if (this.employeeService.cacheEmployees) {
      this.employees = this.employeeService.cacheEmployees;
    } else {
      this.employeeService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.employees = this.employeeService.cacheEmployees = all;
      });
    }
  }

  getAllSchools() {
    if (this.employeeService.cacheEmployees) {
      this.schools = this.employeeService.cacheEmployees;
    } else {
      this.schoolService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.schools = this.employeeService.cacheEmployees = all;
      });
    }
  }

  capNhatDonHang() {
    this.order = this.orderService.removePropertiesBeforeSave(this.order);
    this.orderService.update(this.orderId, this.order).then(
      () => {
        this.showToa();
        setTimeout(() => {
          this.utilService.gotoPage('pages/chicken/order-list');
        }, 5000);
      },
    );
  }
}
