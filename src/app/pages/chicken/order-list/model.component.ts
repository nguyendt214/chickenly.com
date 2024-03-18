import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map, take } from 'rxjs/operators';
import { Cart, Order, OrderService } from '../../../main/order.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { School, SchoolService } from '../../../main/school.service';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CartDialog } from '../order/cart-dialog/cart-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilService } from '../../../main/util.service';
import { BepDialog } from '../order/don-hang-cho-bep-dialog/bep-dialog.component';
import { CategoryService } from '../../../main/category.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ngx-smart-table-order-list',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class OrderListComponent implements OnInit {
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
  showAllOrder = false;
  numberOrder = 1000;
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
        title: 'Tổng tiền (VNĐ)',
        valuePrepareFunction: (cell, row) => {
          let total = 0;
          row.item.forEach((item: Cart) => {
            total += (item.qty - (item.qtyReturn ?? 0)) * item.price;
          });
          return this.currencyPipe.transform(total, '', '', '1.0-0');
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
          title: '<span class="custom-action">SỬA ĐƠN</span>',
        },
        {
          name: 'clone',
          title: '<span class="custom-action">COPY</span>',
        },
      ],
      columnTitle: '',
    },
    pager: {
      perPage: 50,
    },
    noDataMessage: 'Không thấy ĐƠN HÀNG nào!',
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private orderService: OrderService,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog,
    private utilService: UtilService,
    private datePipe: DatePipe,
    private customerService: CustomerService,
    private schoolService: SchoolService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService,
  ) {
    this.utilService.loaded = false;
    this.getAllInParallel();
  }

  getAllInParallel() {
    forkJoin([
      this.customerService.getAll3().pipe(take(1)),
      this.schoolService.getAll3().pipe(take(1)),
      this.employeeService.getAll3().pipe(take(1)),
      this.orderService.getAll3().pipe(take(1)),
    ]).subscribe(
      (all) => {
        this.customers = this.customerService.cacheCustomers = all[0];
        this.schools = this.schoolService.cacheSchools = this.allSchools = all[1];
        this.employees = this.employeeService.cacheEmployees = all[2];
        this.orderService.cacheOrder = all[3];
        this.preparePageData(all[3]);
      },
      () => {
      },
      () => this.utilService.loaded = true
    );
  }

  preparePageData(orders: Order[]) {
    orders.forEach((o: Order) => {
      o.sItem = this.utilService.groupItemBy(o.item, 'categoryKey');
    });
    this.all = orders;
    this.orderFilter = orders;
    this.source.load(this.orderFilter);
    // Lấy order cho từ T2-T7 của tuần này
    const date = this.orderService.getCurrentWeek();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    this.filterByDate(this.startDate, this.endDate);
    this.utilService.loaded = true;
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
      this.orderService.filterStartDate = this.utilService.getDateFromString(startDate.value);
      this.orderService.filterEndDate = this.utilService.getDateFromString(endDate.value);
      this.oFilter.startDate = this.orderService.filterStartDate;
      this.oFilter.endDate = this.orderService.filterEndDate;
    }
    this.globalFilter();
  }

  indonchobep() {
    let items: Cart[] = [];
    let date = (new Date()).toLocaleDateString('vi-VN');
    let comQty = 0;
    let comLy = 0;
    const orders: Order[] = JSON.parse(JSON.stringify(this.orderFilter));
    orders.forEach((o: Order) => {
      date = (new Date(o?.date ?? '')).toLocaleDateString('vi-VN');
      o.item.forEach((c: Cart) => {
        const exists = items.filter((item: Cart) => item.product.key === c.product.key).length;
        if (exists) {
          items.forEach((item: Cart) => {
            if (item.product.key === c.product.key) {
              item.qty += c.qty;
            }
          });
        } else {
          items.push(c);
        }
        // Tính tổng CƠM
        if (c.categoryKey === this.categoryService.comKey) {
          comQty += c.qty;
        }
        if (c.categoryKey === this.categoryService.comLyKey) {
          comLy += c.qty;
        }
      });
    });
    items = this.orderService.sortByCategory(items);
    this.dialog.open(BepDialog, {
      width: '100%',
      data: {cart: items, dateStr: date, comQty: comQty, comLy},
      position: {top: '10px'},
    });
  }

  onCustom(event) {
    if (event.action === 'tra-hang') {
      this.utilService.gotoPage('pages/chicken/order/edit/' + event.data.key);
    } else if (event.action === 'clone') {
      this.orderService.orderClone = event.data;
      this.utilService.gotoPage('pages/chicken/order');
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

  prevWeek() {
    this.orderService.filterStartDate = null;
    const date = this.orderService.getLastWeek();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    this.globalFilter();
  }

}
