import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
  styleUrls: ['order.component.scss'],
})
export class OrderEdit2Component implements OnInit {
  // TẠO ĐƠN HÀNG
  order: Order = new Order();
  schools: School[] = [];
  allSchools: School[] = [];
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  products: Product[] = [];
  allCustomers: Customer[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  panelOpenState = false;
  firstForm: UntypedFormGroup;
  secondForm: UntypedFormGroup;
  thirdForm: UntypedFormGroup;
  enableTaoDonHang = false;
  today = new Date();
  toaConfig = {};
  selectKH = '';
  selectSchool = '';
  selectEmployee = '';
  orderId: string;

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
    this.getAllProductTypes();
    this.getAllCategories();
    this.getAllCustomer();
    this.getAllEmployee();
    this.getAllProducts();
    this.getAllSchools();
    this.getOrderDetail();
  }

  ngOnInit() {
  }

  getOrderDetail() {
    this.orderService.getOrderByKey(this.orderId)
      .subscribe(order => {
        this.order = order;
        this.selectKH = this.order?.customer?.key ?? '';
        this.selectSchool = this.order?.school?.key ?? '';
        this.selectEmployee = this.order?.employee?.key ?? '';
        this.today = new Date(this.order?.date ?? '');
        this.order.sItem = this.utilService.groupItemBy(this.order.item, 'categoryKey');
        this.order = Object.assign({}, this.order);
        this.checkButtonTaoDonHang();
        this.utilService.loaded = true;
      });
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
    this.toastrConfig();
    this.toastrService.show(
      'Tự động quay trở lại danh sách đơn hàng sau 3 giây',
      `CẬP NHẬT ĐƠN HÀNG THÀNH CÔNG`,
      this.toaConfig);
  }

  createDateChooice(t: string, e: any) {
    this.order.date = e.value.toLocaleDateString();
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
      this.customers = this.allCustomers = this.customerService.cacheCustomers;
    } else {
      this.customerService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.customers = this.allCustomers = this.customerService.cacheCustomers = all;
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
    if (this.schoolService.cacheSchools) {
      this.schools = this.allSchools = this.schoolService.cacheSchools;
    } else {
      this.schoolService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.schools = this.allSchools = this.schoolService.cacheSchools = all;
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
    this.selectSchool = '';
    this.order.school = null;
  }

  chonTruong(o) {
    this.order.school = o;
    this.order.school = o;
    this.customers = this.allCustomers.filter((c: Customer) => c.key === o.owner);
    if (this.customers.length === 0) {
      this.customers = Object.assign({}, this.allCustomers);
    } else {
      this.selectKH = this.customers[0].key;
    }
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
      && (this.order.item.length > 0);
  }
  removeProduct(productKey: string) {
    this.order.item = this.order.item.filter((item: Cart) => item.product.key !== productKey);
    this.order.sItem = this.utilService.groupItemBy(this.order.item, 'categoryKey');
    this.order = Object.assign({}, this.order);
  }

  capNhatDonHang() {
    this.order = this.orderService.removePropertiesBeforeSave(this.order);
    this.order.updated = (new Date()).toLocaleDateString();
    this.orderService.update(this.orderId, this.order).then(
      () => {
        this.showToa();
        // Clear order cache
        this.orderService.cacheOrder = null;
        this.utilService.clearCache([this.orderService.lcKey]);
        setTimeout(() => {
          this.utilService.gotoPage('pages/chicken/order-list');
        }, 3000);
      },
    );
  }
}
