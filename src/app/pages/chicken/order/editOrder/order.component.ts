import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Cart, Order, OrderService } from '../../../../main/order.service';
import { School, SchoolService } from '../../../../main/school.service';
import { Customer, CustomerService } from '../../../../main/customer.service';
import { Employee, EmployeeService } from '../../../../main/employee.service';
import { Product, ProductService } from '../../../../main/product.service';
import { map, take } from 'rxjs/operators';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { MatDialog } from '@angular/material/dialog';
import { CartDialog } from '../cart-dialog/cart-dialog.component';
import { UtilService } from '../../../../main/util.service';
import { NbToastrService } from '@nebular/theme';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

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
    this.utilService.loaded = false;
    this.getAllInParallel();
  }

  ngOnInit() {
  }

  getAllInParallel() {
    forkJoin([
      this.productTypeService.getAll3().pipe(take(1)),
      this.categoryService.getAll3().pipe(take(1)),
      this.customerService.getAll3().pipe(take(1)),
      this.employeeService.getAll3().pipe(take(1)),
      this.productService.getAll3().pipe(take(1)),
      this.schoolService.getAll3().pipe(take(1)),
    ]).subscribe(
      (all) => {
        console.log(all);
        this.productTypes = this.productTypeService.cacheProductTypes = <ProductType[]>all[0];
        this.productTypeService.storeData(this.productTypes);
        this.categories = this.categoryService.cacheCategory = <Category[]>all[1];
        this.categoryService.storeData(this.categories);
        this.customers = this.allCustomers = this.customerService.cacheCustomers = <Customer[]>all[2];
        this.customerService.storeData(this.customers);
        this.selectKH = this.customers[0].key;
        this.employees = this.employeeService.cacheEmployees = <Employee[]>all[3];
        this.employeeService.storeData(this.employees);
        this.products = this.productService.cacheProducts = <Product[]>all[4];
        this.productService.storeData(this.productService.cacheProducts);
        this.prepareProducts();
        this.schools = this.allSchools = this.schoolService.cacheSchools = <School[]>all[5];
        this.schoolService.storeData(this.schools);
        this.getOrderDetail();
      },
      () => {
      },
      () => this.utilService.loaded = true
    );
  }

  getOrderDetail() {
    this.order = this.orderService.getOrderByKeyKevin(this.orderId);
    if (this.order) {
      this.selectKH = this.order?.customer?.key ?? '';
      this.selectSchool = this.order?.school?.key ?? '';
      this.selectEmployee = this.order?.employee?.key ?? '';
      this.today = new Date(this.order?.date ?? '');
      this.order.sItem = this.utilService.groupItemBy(this.order.item, 'categoryKey');
      this.order = Object.assign({}, this.order);
      this.checkButtonTaoDonHang();
      this.utilService.loaded = true;
    } else {
      this.utilService.gotoPage('pages/chicken/order-list');
    }
  }

  toastrConfig() {
    this.toaConfig = {
      status: 'success',
      destroyByClick: true,
      duration: 1000,
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
    this.order.date = e.value.toISOString();
  }

  prepareProducts() {
    // Category
    this.productService.cacheProducts.forEach((p: Product) => {
      p.category = this.categories.find((c: Category) => c.key === p.categoryKey);
    });
    // Product Type
    this.productService.cacheProducts.forEach((p: Product) => {
      p.productType = this.productTypes.find((pt: ProductType) => pt.key === p.productTypeKey);
    });
    this.products = this.productService.groupProductByCategory(this.productService.cacheProducts);
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
    this.order.updated = (new Date()).toISOString();
    this.orderService.update(this.orderId, this.order).then(
      () => {
        this.showToa();
        // Clear order cache
        this.orderService.cacheOrder = null;
        this.utilService.clearCache([this.orderService.lcKey]);
        setTimeout(() => {
          this.utilService.gotoPage('pages/chicken/order-list');
        }, 1000);
      },
    );
  }
}
