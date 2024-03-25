import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map, take } from 'rxjs/operators';
import { Cart, CongNoByCustomer, CongNoBySchool, Order, OrderService } from '../../../main/order.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { School, SchoolService } from '../../../main/school.service';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CartDialog } from '../order/cart-dialog/cart-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilService } from '../../../main/util.service';
import { CategoryService } from '../../../main/category.service';
import { ExportCsvService } from '../../../main/exportCsv.service';
import { forkJoin } from 'rxjs';

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
  isSameDay = false;
  showOrder = false;
  showSellPrice = true;
  showAllCongNo = false;
  numberCongNo = 1000;
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
      delete: false,
    },
    pager: {
      perPage: 10,
    },
    noDataMessage: 'Không thấy công nợ nào!',
  };

  source: LocalDataSource = new LocalDataSource();
  tongHopOrder: Order;
  thuCongNo = true;
  cnTheoTuan = 0;

  constructor(
    private service: SmartTableData,
    public orderService: OrderService,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog,
    private utilService: UtilService,
    private datePipe: DatePipe,
    private customerService: CustomerService,
    private schoolService: SchoolService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService,
    private exportCsvService: ExportCsvService,
  ) {
    this.utilService.loaded = false;
    this.getAllInParallel();
  }

  getAllInParallel() {
    const getAllCustomers = this.customerService.getAll3();
    const getAllSchools = this.schoolService.getAll3();
    const getAllEmployees = this.employeeService.getAll3();
    const getAllOrders = this.orderService.getAll3();
    forkJoin([
      getAllCustomers.pipe(take(1)),
      getAllSchools.pipe(take(1)),
      getAllEmployees.pipe(take(1)),
      getAllOrders.pipe(take(1)),
    ]).subscribe(
      (all) => {
        this.customers = this.customerService.cacheCustomers = all[0];
        this.customerService.storeData(this.customers);
        this.schools = this.schoolService.cacheSchools = this.allSchools = all[1];
        this.schoolService.storeData(this.schools);
        this.employees = this.employeeService.cacheEmployees = all[2];
        this.employeeService.storeData(this.employees);
        this.orderService.cacheOrder = all[3];
        this.orderService.storeData(all[3]);
        this.preparePageData(all[3]);
      },
      () => {
      },
      () => this.utilService.loaded = true,
    );
  }

  preparePageData(orders: Order[]) {
    orders.forEach((o: Order) => {
      o.sItem = this.utilService.groupItemBy(o.item, 'categoryKey');
    });
    this.all = orders;
    this.orderFilter = orders;
    this.source.load(this.orderFilter);
    // Lấy order cho 7 ngày gần nhất
    const date = this.orderService.getCurrentWeek();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    this.filterByDate(this.startDate, this.endDate);
  }

  ngOnInit() {
  }

  onCreateConfirm(e: any) {
    this.orderService.create(e?.newData)
      .then(() => {
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    this.orderService.update(e?.newData?.key, e?.newData)
      .then(() => {
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.orderService.delete(e?.data?.key)
        .then(() => {
          this.utilService.clearCache([this.orderService.lcKey]);
          e.confirm.resolve();
        })
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
      this.orderService.filterStartDate = this.utilService.getDateFromString(startDate.value);
      this.orderService.filterEndDate = this.utilService.getDateFromString(endDate.value);
      this.oFilter.startDate = this.orderService.filterStartDate;
      this.oFilter.endDate = this.orderService.filterEndDate;
      this.isSameDay = this.oFilter.startDate && this.oFilter.endDate &&
        this.orderService.filterStartDate.getTime() === this.orderService.filterEndDate.getTime();
    }
    this.globalFilter();
  }

  onCustom(event) {
    if (event.action === 'tra-hang') {
      this.utilService.gotoPage('pages/chicken/order/' + event.data.key);
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
      return this.orderService.filterStartDate <= orderDate && orderDate <= this.orderService.filterEndDate;
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
    setTimeout(() => {
      this.tongHopCongNo();
    });
  }

  getPreviousWeek(previous: number) {
    this.cnTheoTuan = previous;
    const date = this.orderService.getLastWeek(previous);
    this.thuCongNo = true;
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    this.globalFilter();
  }

  resetFilter() {
    this.orderService.filterStartDate = null;
    const date = this.orderService.getCurrentWeek();
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
    let qtyReturn: number = 0;
    order.item.forEach((c: Cart) => {
      if (c.product.key === productKey) {
        qtyReturn = c.qtyReturn;
      }
    });
    return qtyReturn === 0 ? ' ' : qtyReturn;
  }

  getTotalByItem(item: Cart) {
    return (item.qty - this.getQtyReturn(item.qtyReturn)) * item.price;
  }

  getTotalReturnByItem(item: Cart) {
    return (item.qtyReturn > 0) ? item.qtyReturn : '';
  }

  /**
   * Tổng tiền 1 order
   * @param order
   */
  tongTienByOrder(order: Order) {
    const total = this.calculatorOrderPrice(order);
    return this.currencyPipe.transform(total, '', '', '1.0-0') + ' VNĐ';
  }

  calculatorOrderPrice(o: Order) {
    let total = 0;
    if (!o) {
      return 0;
    }
    o.item.forEach((item: Cart) => {
      total += (item.qty - this.getQtyReturn(item.qtyReturn)) * item.price;
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
      total += this.calculatorOrderPrice(o);
    });
    return total;
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

    this.congNoTheoKhachHang();
    this.tongHopOrder = this.hoaDonTongBySchool(this.orderFilter);
  }

  congNoTheoKhachHang() {
    this.customers.forEach((c: Customer) => {
      const cnbs = JSON.parse(JSON.stringify(this.orderBySchool));
      const congNo = new CongNoByCustomer();
      congNo.schools = [];
      congNo.masterTotal = 0;
      congNo.customer = Object.assign({}, c);
      cnbs.forEach((orders: Order[], index: number) => {
        if (orders[0].customer.key === c.key) {
          const congNoBySchool = new CongNoBySchool();
          congNoBySchool.school = Object.assign({}, orders[0].school);
          congNoBySchool.total = this.tongTienByOrders(orders);
          congNo.masterTotal += congNoBySchool.total;
          congNo.schools.push(congNoBySchool);
        }
      });
      this.congNoByCustomer.push(congNo);
    });
  }

  /**
   * Công nợ theo từng trường
   * @param orders
   */
  hoaDonTongBySchool(orders: Order[]) {
    const order = new Order();
    order.item = [];
    order.orderKeys = [];
    orders.forEach((o: Order) => {
      order.orderKeys.push(o.key);
      o.item.forEach((c: Cart) => {
        const exists = order.item.filter((item: Cart) => item.product.key === c.product.key).length;
        if (exists) {
          order.item.forEach((item: Cart) => {
            if (item.product.key === c.product.key) {
              item.qty += c.qty;
              item.qtyReturn += this.getQtyReturn(c.qtyReturn);
            }
          });
        } else {
          order.item.push(new Cart(c.qty, c.price, c.product, c.product.categoryKey, this.getQtyReturn(c.qtyReturn)));
          order.customer = o.customer;
          order.school = o.school;
          order.employee = o.employee;
        }
      });
    });
    order.sItem = this.utilService.groupItemBy(order.item, 'categoryKey');
    return order;
  }

  getQtyReturn(qtyReturn: any) {
    if (qtyReturn === '' || qtyReturn === ' ') {
      return 0;
    }
    return qtyReturn;
  }

  exportCongNoTong() {
    const dataExport = {
      order: this.tongHopOrder,
      totalPrice: this.tongTienByOrder(this.tongHopOrder),
      sheetName: 'Tổng hợp',
      date: {
        start: this.datePipe.transform(new Date(this.oFilter.startDate), 'dd-MM-YYYY'),
        end: this.datePipe.transform(new Date(this.oFilter.endDate), 'dd-MM-YYYY'),
      },
    };
    let fileName = 'tongHop';
    if (this.oFilter.customer) {
      fileName += '-' + this.oFilter.customer.name.replace(' ', '-');
    }
    if (this.oFilter.school) {
      fileName += '-' + this.oFilter.school.name.replace(' ', '-');
    }
    fileName += '-' + this.datePipe.transform(new Date(this.oFilter.startDate), 'dd-MM-YYYY') +
      '-' + this.datePipe.transform(new Date(this.oFilter.endDate), 'dd-MM-YYYY');

    this.exportCsvService.exportCongNoTong(dataExport, fileName);
  }

  exportCongNoTong1() {
    const dataExport = {
      order: this.orderFilter,
      sheetName: 'Tổng hợp',
      date: {
        start: this.datePipe.transform(new Date(this.oFilter.startDate), 'dd-MM-YYYY'),
        end: this.datePipe.transform(new Date(this.oFilter.endDate), 'dd-MM-YYYY'),
      },
    };
    let fileName = 'tongHop1';
    if (this.oFilter.customer) {
      fileName += '-' + this.oFilter.customer.name.replace(' ', '-');
    }
    if (this.oFilter.school) {
      fileName += '-' + this.oFilter.school.name.replace(' ', '-');
    }
    fileName += '-' + this.datePipe.transform(new Date(this.oFilter.startDate), 'dd-MM-YYYY') +
      '-' + this.datePipe.transform(new Date(this.oFilter.endDate), 'dd-MM-YYYY');

    this.exportCsvService.exportCongNoTong1(dataExport, fileName);
  }

  truyThuCongNo() {
    const dataCongNo = {
      order: this.tongHopOrder,
      totalPrice: this.calculatorOrderPrice(this.tongHopOrder),
      time: 'Từ ' + this.datePipe.transform(new Date(this.oFilter.startDate), 'dd/MM/YYYY') +
        '-' + this.datePipe.transform(new Date(this.oFilter.endDate), 'dd/MM/YYYY'),
    };
    this.orderService.truyThuCongNo = dataCongNo;
    this.utilService.gotoPage('pages/chicken/thu-chi/add/thu');
  }

}
