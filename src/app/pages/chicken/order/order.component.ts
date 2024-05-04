import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Cart, Order, OrderService } from '../../../main/order.service';
import { School, SchoolService } from '../../../main/school.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { Product, ProductService } from '../../../main/product.service';
import { map, take } from 'rxjs/operators';
import { Category, CategoryService } from '../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';
import { MatDialog } from '@angular/material/dialog';
import { CartDialog } from './cart-dialog/cart-dialog.component';
import { UtilService } from '../../../main/util.service';
import { NbToastrService } from '@nebular/theme';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ngx-order',
  templateUrl: 'order.component.html',
  styleUrls: ['order.component.scss'],
})
export class OrderComponent implements OnInit {
  // TẠO ĐƠN HÀNG
  order: Order = new Order();
  schools: School[] = [];
  allSchools: School[] = [];
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  allProducts: Product[] = [];
  products: Product[] = [];
  topProducts: Product[] = [];
  allCustomers: Customer[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  panelOpenState = false;
  firstForm: UntypedFormGroup;
  secondForm: UntypedFormGroup;
  thirdForm: UntypedFormGroup;
  enableTaoDonHang = false;
  today = new Date();
  tomorrow = new Date(this.today);
  toaConfig = {};
  selectKH = '';
  selectSchool = '';
  selectEmployee = '';

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
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
    this.utilService.loaded = false;
    this.getAllInParallel();
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
        this.productTypes = this.productTypeService.cacheProductTypes = <ProductType[]>all[0];
        this.productTypeService.storeData(this.productTypes);
        this.categories = this.categoryService.cacheCategory = <Category[]>all[1];
        this.categoryService.storeData(this.categories);
        this.customers = this.allCustomers = this.customerService.cacheCustomers = <Customer[]>all[2];
        this.customerService.storeData(this.customers);
        this.selectKH = this.customers[0].key;
        this.employees = this.employeeService.cacheEmployees = <Employee[]>all[3];
        this.employeeService.storeData(this.employees);
        this.products = this.allProducts = this.productService.cacheProducts = <Product[]>all[4];
        this.productService.storeData(this.productService.cacheProducts);
        this.prepareProducts();
        this.schools = this.allSchools = this.schoolService.cacheSchools = <School[]>all[5];
        this.schoolService.storeData(this.schools);
        this.preparePageData();
      },
      () => {
      },
      () => this.utilService.loaded = true
    );
  }

  preparePageData() {
    this.order.item = [];
    this.order.date = this.tomorrow.toISOString();
    this.utilService.loaded = true;
    this.toastrConfig();
    if (this.orderService.orderClone) {
      delete this.orderService.orderClone['key'];
      this.order = Object.assign({}, this.orderService.orderClone);
      this.order.paid = false;
      this.selectKH = this.order.customer.key;
      this.selectSchool = this.order.school.key;
      this.selectEmployee = this.order?.employee?.key ?? '';
      this.tomorrow = new Date(this.order?.date ?? '');
      this.order.note = '';
      this.order.updated = this.order.date;
      this.order.item.forEach((item: Cart) => {
        item.qtyReturn = 0;
        item.product.note = '';
      });
      this.order.clone = 'Clone from ' + this.orderService.orderClone.customer.name + ', '
        + this.orderService.orderClone.school.name + ', ' + this.orderService.orderClone.date;
      this.checkButtonTaoDonHang();
    }
  }

  ngOnInit() {
  }

  toastrConfig() {
    this.toaConfig = {
      status: 'success',
      destroyByClick: true,
      duration: 2000,
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
    if (this.orderService.orderClone) {
      this.utilService.gotoPage('pages/chicken/order-list');
    }
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
      this.order.item.push(new Cart(1, this.getCustomerPrice(p), p, p.categoryKey));
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
    this.updateCartPrice();
    // Lọc sản phẩm theo khách hàng
    this.products = this.allProducts.filter((p: Product) => o.products.includes(p.key));
    this.topProducts = this.products.filter((p: Product) => p.topProduct);
    this.products = this.productService.groupProductByCategory(this.products);
  }

  updateCartPrice() {
    this.order.item.forEach((cartItem: Cart) => {
      cartItem.price = this.getCustomerPrice(cartItem.product);
    });
    this.order.sItem = this.utilService.groupItemBy(this.order.item, 'categoryKey');
    this.order = Object.assign({}, this.order);
  }

  chonTruong(o) {
    this.order.school = o;
    this.customers = this.allCustomers.filter((c: Customer) => c.key === o.owner);
    if (this.customers.length === 0) {
      this.customers = Object.assign({}, this.allCustomers);
    } else {
      this.order.customer = this.customers[0];
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

  createNewOrder(order: any) {
    this.order = order;
    this.order.sItem = this.utilService.groupItemBy(this.order.item, 'categoryKey');
    this.order = Object.assign({}, this.order);
    this.checkButtonTaoDonHang();
  }

  getCustomerPrice(p: Product) {
    if (p) {
      if (p?.priceByUser && this.order.customer) {
        return p?.priceByUser[this.order?.customer?.key] ?? p?.price;
      }
      return p?.price;
    }
    return 0;
  }

  taoDonHang() {
    this.order = this.orderService.removePropertiesBeforeSave(this.order);
    this.orderService.create(this.order).then(
      () => {
        this.order.item = [];
        this.order.sItem = null;
        this.orderService.cacheOrder = null;
        this.utilService.clearCache([this.orderService.lcKey]);
        this.showToa();
        this.checkButtonTaoDonHang();
        if (this.orderService.orderClone) {
          this.orderService.orderClone = null;
          this.utilService.gotoPage('pages/chicken/order-list');
        }
      },
    );
  }
}
