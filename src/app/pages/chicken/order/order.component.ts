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
    this.getAllProductTypes();
    this.getAllCategories();
    this.getAllCustomer();
    this.getAllEmployee();
    this.getAllProducts();
    this.getAllSchools();
    this.order.item = [];
    this.order.date = this.tomorrow.toString();
    this.toastrConfig();
    if (this.orderService.orderClone) {
      this.order = Object.assign({}, this.orderService.orderClone);
      this.selectKH = this.order.customer.key;
      this.selectSchool = this.order.school.key;
      this.selectEmployee = this.order?.employee?.key ?? '';
      this.tomorrow = new Date(this.order?.date ?? '');
      delete this.order.key;
      this.order.note = '';
      this.order.updated = this.order.date;
      this.orderService.orderClone = null;
      this.order.item.forEach((item: Cart) => {
        item.qtyReturn = 0;
        item.product.note = '';
      });
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
      this.products = this.allProducts = this.productService.cacheProducts;
      this.prepareProducts();

    } else {
      this.productService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.products = this.allProducts = this.productService.cacheProducts = all;
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
    this.topProducts = this.products.filter((p: Product) => p.topProduct);
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
        this.selectKH = this.customers[0].key;
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
        this.showToa();
        this.checkButtonTaoDonHang();
      },
    );
  }
}
