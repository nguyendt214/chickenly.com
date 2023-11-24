import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { Cart, Order, OrderService } from '../../../main/order.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { School, SchoolService } from '../../../main/school.service';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CartDialog } from '../order/cart-dialog/cart-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilService } from '../../../main/util.service';
import { BepDialog } from '../order/don-hang-cho-bep-dialog/bep-dialog.component';

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
        title: 'Ngày',
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
        title: 'TRƯỜNG',
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
  ) {
    if (this.modelService.cacheOrder) {
      this.all = this.modelService.cacheOrder;
      this.orderFilter = this.modelService.cacheOrder;
      this.source.load(this.orderFilter);
    } else {
      this.modelService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.modelService.cacheOrder = all;
        this.all = all;
        this.orderFilter = all;
        this.source.load(this.orderFilter);
      });
    }

    this.getAllCustomer();
    this.getAllSchools();
    this.getAllEmployee();

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

  indonchobep() {
    let items: Cart[] = [];
    let date = (new Date()).toLocaleDateString('vi-VN');
    this.orderFilter.forEach((o: Order) => {
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
      });
    });
    items = this.modelService.sortByCategory(items);
    this.dialog.open(BepDialog, {
      width: '100%',
      data: {cart: items, dateStr: date},
    });
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
  }

  resetFilter() {
    this.modelService.filterStartDate = null;
    const date = this.modelService.getLast7Days();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter = {
      startDate: this.startDate,
      endDate: this.endDate,
      customer: null,
      school: null,
      employee: null,
    };
    this.globalFilter();
  }

}
