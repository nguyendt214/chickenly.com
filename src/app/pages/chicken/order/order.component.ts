import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Cart, Order, OrderService } from '../../../main/order.service';
import { School, SchoolService } from '../../../main/school.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { Product, ProductService } from '../../../main/product.service';
import { map } from 'rxjs/operators';
import { Category, CategoryService } from '../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';
import { MatDialog } from '@angular/material/dialog';
import { CartDialog } from './cart-dialog/cart-dialog.component';
import { UtilService } from '../../../main/util.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-order',
  templateUrl: 'order.component.html',
  styleUrls: ['order.component.scss'],
})
export class OrderComponent implements OnInit {
  order: Order = new Order();
  schools: School[] = [];
  allSchools: School[] = [];
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
  ) {
    this.getAllProductTypes();
    this.getAllCategories();
    this.getAllCustomer();
    this.getAllEmployee();
    this.getAllProducts();
    this.getAllSchools();
    this.order.item = [];
    this.order.date = this.today.toString();
    this.toastrConfig();
  }

  ngOnInit() {
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
      'Tiếp tục nào!!!',
      `Tạo ĐƠN HÀNG THÀNH CÔNG`,
      this.toaConfig);
  }

  createDateChooice(t: string, e: any) {
    this.order.date = e.value.toString();
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

  getAllProducts() {
    if (this.productService.cacheProducts) {
      this.products = this.productService.cacheProducts;
      this.prepareProducts();

    } else {
      this.productService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.products = this.productService.cacheProducts = all;
        this.prepareProducts();
      });
    }
  }

  prepareProducts() {
    // Category
    this.products.forEach((p: Product) => {
      p.category = this.categories.find((c: Category) => c.key === p.categoryKey);
    });
    // Product Type
    this.products.forEach((p: Product) => {
      p.productType = this.productTypes.find((pt: ProductType) => pt.key === p.productTypeKey);
    });
    this.products = this.productService.groupProductByCategory(this.products);
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
      this.schools = this.allSchools = this.employeeService.cacheEmployees;
    } else {
      this.schoolService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.schools = this.allSchools = this.employeeService.cacheEmployees = all;
      });
    }
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
      this.order.item.push(new Cart(1, (p?.price ?? 0), p, p.categoryKey));
    }
    this.order.sItem = this.utilService.groupItemBy(this.order.item, 'categoryKey');
    this.order = Object.assign({}, this.order);
    this.checkButtonTaoDonHang();
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

  chonKH(o) {
    this.order.customer = o;
    this.checkButtonTaoDonHang();
    this.schools = this.allSchools.filter((s: School) => s.owner === o.key);
  }

  chonTruong(o) {
    this.order.school = o;
    this.checkButtonTaoDonHang();
  }

  chonNV(o) {
    this.order.employee = o;
    this.checkButtonTaoDonHang();
  }

  open() {
    const dialogRef = this.dialog.open(CartDialog, {
      width: '100%',
      data: {order: this.order, products: this.products},
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  checkButtonTaoDonHang() {
    this.enableTaoDonHang = !!this.order.customer && !!this.order.school
      && !!this.order.employee && (this.order.item.length > 0);
  }

  taoDonHang() {
    this.order = this.orderService.removePropertiesBeforeSave(this.order);
    this.orderService.create(this.order).then(
      () => {
        this.order.item = [];
        this.order.sItem = null;
        this.showToa();
        this.checkButtonTaoDonHang();
      },
    );
  }
}
