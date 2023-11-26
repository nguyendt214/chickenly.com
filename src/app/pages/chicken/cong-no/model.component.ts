import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { Cart, CongNoByCustomer, CongNoBySchool, Order, OrderService } from '../../../main/order.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { School, SchoolService } from '../../../main/school.service';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CartDialog } from '../order/cart-dialog/cart-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilService } from '../../../main/util.service';
import { BepDialog } from '../order/don-hang-cho-bep-dialog/bep-dialog.component';
import { CategoryService } from '../../../main/category.service';

@Component({
  selector: 'ngx-smart-table-cong-no',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class CongNoComponent implements OnInit {
  all?: Order[] = [];
  orderFilter?: Order[] = [];
  customers: Customer[] = [];
  allSchools: School[] = [];
  schools: School[] = [];
  employees: Employee[] = [];
  startDate: any;
  endDate: any;
  oFilter: any = {};
  selectKH = '';
  selectSchool = '';
  selectEmployee = '';
  orderByCustomer = [];
  orderBySchool = [];
  orderTotalBySchool = [];
  orderByEmployee = [];
  congNoByCustomer: CongNoByCustomer[] = [];
  settings = {
    add: {
      confirmCreate: true,
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      confirmSave: true,
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      date: {
        title: 'NGÀY',
        type: 'string',
        valuePrepareFunction: (c, row) => {
          return this.datePipe.transform(new Date(c), 'dd/MM/YYYY');
        },
        sort: true,
        sortDirection: 'desc',
        compareFunction: (direction: any, c1: string, c2: string) => {
          const first = (new Date(c1)).getTime();
          const second = (new Date(c2)).getTime();
          if (first < second) {
            return -1 * direction;
          }
          if (first > second) {
            return direction;
          }
          return 0;
        },
        filter: false,
      },
      customer: {
        title: 'KHÁCH HÀNG',
        type: 'string',
        valuePrepareFunction: (c: Customer) => {
          return c.name;
        },
        compareFunction: (direction: any, c1: Customer, c2: Customer) => {
          if (direction === 1) {
            return c1.name.localeCompare(c2.name);
          }
          return c2.name.localeCompare(c1.name);
        },
        filterFunction(el?: any, search?: string): boolean {
          const match = el?.name.toUpperCase().indexOf(search.toUpperCase()) > -1;
          if (match || search === '') {
            return true;
          } else {
            return false;
          }
        },
      },
      school: {
        title: 'ĐỊA ĐIỂM',
        type: 'string',
        valuePrepareFunction: (c: School) => {
          return c.name;
        },
        compareFunction: (direction: any, c1: School, c2: School) => {
          if (direction === 1) {
            return c1.name.localeCompare(c2.name);
          }
          return c2.name.localeCompare(c1.name);
        },
        filterFunction(el?: any, search?: string): boolean {
          const match = el?.name.toUpperCase().indexOf(search.toUpperCase()) > -1;
          if (match || search === '') {
            return true;
          } else {
            return false;
          }
        },
      },
      employee: {
        title: 'Nhân Viên Giao',
        type: 'string',
        valuePrepareFunction: (c: Employee) => {
          return c.name;
        },
        compareFunction: (direction: any, c1: Employee, c2: Employee) => {
          if (direction === 1) {
            return c1.name.localeCompare(c2.name);
          }
          return c2.name.localeCompare(c1.name);
        },
        filterFunction(el?: any, search?: string): boolean {
          const match = el?.name.toUpperCase().indexOf(search.toUpperCase()) > -1;
          if (match || search === '') {
            return true;
          } else {
            return false;
          }
        },
      },
      orderTotal: {
        title: 'Tổng tiền',
        valuePrepareFunction: (cell, row) => {
          let total = 0;
          row.item.forEach((item: Cart) => {
            total += (item.qty - (item.qtyReturn ?? 0)) * item.price;
          });
          return this.currencyPipe.transform(total, '', '', '1.0-0') + ' VNĐ';
        },
        filter: false,
      },
    },
    actions: {
      edit: false,
      add: false,
      delete: true,
      custom: [
        {
          name: 'tra-hang',
          title: '<span class="custom-action">Trả hàng</span>',
        },
      ],
      columnTitle: '',
    },
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private modelService: OrderService,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog,
    private utilService: UtilService,
    private datePipe: DatePipe,
    private customerService: CustomerService,
    private schoolService: SchoolService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService,
  ) {
    if (this.modelService.cacheOrder) {
      this.preparePageData(this.modelService.cacheOrder);
    } else {
      this.modelService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.modelService.cacheOrder = all;
        this.preparePageData(all);
      });
    }

    this.getAllCustomer();
    this.getAllSchools();
    this.getAllEmployee();
  }

  preparePageData(orders: Order[]) {
    orders.forEach((o: Order) => {
      o.sItem = this.utilService.groupItemBy(o.item, 'categoryKey');
    });
    this.all = orders;
    this.orderFilter = orders;
    this.source.load(this.orderFilter);
    // Lấy order cho 7 ngày gần nhất
    const date = this.modelService.getLast7Days();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    this.filterByDate(this.startDate, this.endDate);
  }

  ngOnInit() {
  }

  onCreateConfirm(e: any) {
    this.modelService.create(e?.newData)
      .then(() => {
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    this.modelService.update(e?.newData?.key, e?.newData)
      .then(() => {
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.modelService.delete(e?.data?.key)
        .then(() => e.confirm.resolve())
        .catch(() => e.confirm.reject());
    } else {
      e.confirm.reject();
    }
  }

  printOrder(e) {
    const dialogRef = this.dialog.open(CartDialog, {
      width: '100%',
      data: {order: e.data},
      position: {top: '10px'},
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  filterByDate(startDate: any, endDate: any) {
    if (!(startDate instanceof Date)) {
      this.modelService.filterStartDate = this.utilService.getDateFromString(startDate.value);
      this.modelService.filterEndDate = this.utilService.getDateFromString(endDate.value);
      this.oFilter.startDate = this.modelService.filterStartDate;
      this.oFilter.endDate = this.modelService.filterEndDate;
    }
    this.globalFilter();
  }

  onCustom(event) {
    if (event.action === 'tra-hang') {
      this.utilService.gotoPage('pages/chicken/order/' + event.data.key);
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
        this.schools = this.schoolService.cacheSchools = this.allSchools = all;
      });
    }
  }

  filterByCustomer(c: Customer) {
    if (c) {
      this.oFilter.customer = c;
      this.schools = this.allSchools.filter((s: School) => s.owner === c.key);
      this.selectSchool = '';
      this.oFilter.school = null;
    } else {
      this.oFilter.customer = null;
      this.schools = this.allSchools;
    }
    this.globalFilter();
  }

  filterBySchool(c: School) {
    if (c) {
      this.oFilter.school = c;
    } else {
      this.oFilter.school = null;
    }
    this.globalFilter();
  }

  filterByEmployee(c: Employee) {
    if (c) {
      this.oFilter.employee = c;
    } else {
      this.oFilter.employee = null;
    }
    this.globalFilter();
  }

  globalFilter() {
    // Always filter by date
    this.orderFilter = this.all.filter((o: Order) => {
      const orderDate = new Date((new Date(o?.date)).setHours(0, 0, 0, 0));
      return this.modelService.filterStartDate <= orderDate && orderDate <= this.modelService.filterEndDate;
    });

    if (this.oFilter.customer) {
      this.orderFilter = this.orderFilter.filter((o: Order) => o.customer.key === this.oFilter.customer.key);
    }
    if (this.oFilter.school) {
      this.orderFilter = this.orderFilter.filter((o: Order) => o.school.key === this.oFilter.school.key);
    }
    if (this.oFilter.employee) {
      this.orderFilter = this.orderFilter.filter((o: Order) => o.employee.key === this.oFilter.employee.key);
    }
    this.source.load(this.orderFilter);
    // Cong no
    this.tongHopCongNo();
  }

  resetFilter() {
    this.modelService.filterStartDate = null;
    const date = this.modelService.getLast7Days();
    this.startDate = date[0];
    this.endDate = date[1];
    this.selectKH = '';
    this.selectSchool = '';
    this.selectEmployee = '';
    this.oFilter = {
      startDate: this.startDate,
      endDate: this.endDate,
      customer: null,
      school: null,
      employee: null,
    };
    this.globalFilter();
  }

  getReturnByProductKey(order: Order, productKey: string) {
    let qtyReturn: any = '';
    order.item.forEach((c: Cart) => {
      if (c.product.key === productKey) {
        qtyReturn = c.qtyReturn;
      }
    });
    return qtyReturn;
  }

  /**
   * Tổng tiền 1 order
   * @param order
   */
  tongTienByOrder(order: Order) {
    const total = this.calaulatorOrderPrice(order);
    return this.currencyPipe.transform(total, '', '', '1.0-0') + ' VNĐ';
  }

  calaulatorOrderPrice(o: Order) {
    let total = 0;
    o.item.forEach((item: Cart) => {
      total += (item.qty - (item.qtyReturn ?? 0)) * item.price;
    });
    return total;
  }

  /**
   * Tổng tiền theo nhóm order
   * @param orders
   */
  tongTienByOrders(orders: Order[]) {
    let total = 0;
    orders.forEach((o: Order) => {
      total += this.calaulatorOrderPrice(o);
    });
    return this.currencyPipe.transform(total, '', '', '1.0-0') + ' VNĐ';
  }

  tongHopCongNo() {
    const orders: Order[] = JSON.parse(JSON.stringify(this.orderFilter));
    this.orderByCustomer = [];
    this.orderBySchool = [];
    this.orderTotalBySchool = [];
    this.orderByEmployee = [];
    this.congNoByCustomer = [];
    const orderByCustomer = this.utilService.groupItemBy(orders, 'customer.key');
    const orderBySchool = this.utilService.groupItemBy(orders, 'school.key');
    const orderByEmployee = this.utilService.groupItemBy(orders, 'employee.key');

    Object.entries(orderByCustomer).forEach(
      ([key, value]) => this.orderByCustomer.push(value),
    );
    Object.entries(orderBySchool).forEach(
      ([key, value]) => this.orderBySchool.push(value),
    );
    Object.entries(orderByEmployee).forEach(
      ([key, value]) => this.orderByEmployee.push(value),
    );
    // Master Order total by customer
    this.orderBySchool.forEach((_orders: Order[]) => {
      _orders.forEach((order: Order) => {
        order.master = this.hoaDonTongBySchool(_orders);
      });
    });
    // Cong No Tong theo Khach Hang
    this.hoaDonTongByCustomer(this.orderByCustomer);
  }

  hoaDonTongByCustomer(orders: Order[]) {
    orders.forEach((customer: any) => {
      customer.forEach((order: Order, idx) => {
        if (idx === 0) {
          const groupBySchool = this.utilService.groupItemBy(customer, 'school.key');
          const congNo = new CongNoByCustomer();
          congNo.schools = [];
          congNo.masterTotal = 0;
          const schoolKeys = [];
          Object.entries(groupBySchool).forEach(([key, value], index) => {
            const _orders: Order[] = Object.values(value);
            _orders.forEach((o: Order, _idx: number) => {
              if (_idx === 0) {
                // Thêm trường mới
                schoolKeys.push(key);
                const congNoBySchool = new CongNoBySchool();
                congNoBySchool.total = 0;
                congNoBySchool.school = o.school;
                // Tính tổng tiền
                o.item.forEach((cart: Cart) => {
                  congNoBySchool.total += cart.price * (cart.qty - (cart.qtyReturn ?? 0));
                });
                congNo.customer = o.customer;
                congNo.masterTotal += congNoBySchool.total;
                congNo.schools.push(congNoBySchool);
              } else {
                // Đã có trong công nợ, tìm trường và cộng dồn total
                congNo.schools.forEach((cnbs: CongNoBySchool) => {
                  // Tính tổng tiền
                  o.item.forEach((cart: Cart) => {
                    cnbs.total += cart.price * (cart.qty - (cart.qtyReturn ?? 0));
                    congNo.masterTotal += cart.price * (cart.qty - (cart.qtyReturn ?? 0));
                  });
                });
              }
            });
          });
          this.congNoByCustomer.push(congNo);
        }
      });
    });
  }

  hoaDonTongBySchool(orders: Order[]) {
    const order = new Order();
    order.item = [];
    orders.forEach((o: Order) => {
      o.item.forEach((c: Cart) => {
        const exists = order.item.filter((item: Cart) => item.product.key === c.product.key).length;
        if (exists) {
          order.item.forEach((item: Cart) => {
            if (item.product.key === c.product.key) {
              item.qty += c.qty;
              item.qtyReturn += c.qtyReturn ?? 0;
            }
          });
        } else {
          order.item.push(new Cart(c.qty, c.price, c.product, c.product.categoryKey, (c.qtyReturn ?? 0)));
          order.customer = o.customer;
          order.school = o.school;
          order.employee = o.employee;
        }
      });
    });
    order.sItem = this.utilService.groupItemBy(order.item, 'categoryKey');
    return order;
  }

}
