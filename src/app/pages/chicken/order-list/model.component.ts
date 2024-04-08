import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { take } from 'rxjs/operators';
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
          return c.name ?? '';
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
          return c?.name ?? '';
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
          const rowData = row.row.data;
          let total = 0;
          rowData.item.forEach((item: Cart) => {
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
    rowClassFunction: (row) => {
      if (row?.data?.printed1 && this.manualPrint) {
        return 'kopacity kprinted';
      }
    },
  };

  source: LocalDataSource = new LocalDataSource();
  doantThuLabel = 'Tuần này';
  cnTheoTuan = 0;
  dateFilter: any = {};
  manualPrint = false;
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
    // Lấy order cho từ T2-T7 của tuần này
    const date = this.orderService.getCurrentWeek();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    // this.filterByDate(this.startDate, this.endDate);
    this.getAllInParallel();
  }

  getAllInParallel() {
    this.updateDateFilterObject();
    forkJoin([
      this.customerService.getAll3().pipe(take(1)),
      this.schoolService.getAll3().pipe(take(1)),
      this.employeeService.getAll3().pipe(take(1)),
      this.orderService.getLastData(this.dateFilter).pipe(take(1)),
    ]).subscribe(
      (all) => {
        this.customers = this.customerService.cacheCustomers = <Customer[]>all[0];
        this.customerService.storeData(this.customers);
        this.schools = this.schoolService.cacheSchools = this.allSchools = <School[]>all[1];
        this.schoolService.storeData(this.schools);
        this.employees = this.employeeService.cacheEmployees = <Employee[]>all[2];
        this.employeeService.storeData(this.employees);
        this.orderService.cacheOrder = <Order[]>all[3];
        this.orderService.storeCacheData(this.orderService.cacheOrder, this.dateFilter);
        this.orderService.cacheOrder = this.orderService.getDataFromCache();
        this.preparePageData(this.orderService.cacheOrder);
      },
      (err) => {
        console.log('Order error', err);
      },
      () => this.utilService.loaded = true,
    );
  }

  preparePageData(orders: Order[]) {
    orders.forEach((o: Order) => {
      o.sItem = this.utilService.groupItemBy(o.item, 'categoryKey');
      const school = this.schoolService.getSchoolByKey(this.schools, o?.school?.key);
      if (school) {
        o.school.printNumber = school?.printNumber ?? 2;
      }
    });
    this.all = orders;
    this.orderFilter = orders;
    this.globalFilter();
    this.source.load(this.orderFilter);
    this.utilService.loaded = true;
  }

  ngOnInit() {
  }

  forceUpdateOrderDate() {
    this.orderService.getAll3()
      .subscribe(
        (orders: Order[]) => {
          console.log(orders);
          console.log('Total', orders.length);
          orders.forEach((o: Order) => {
            if (o?.key) {
              o.date = (new Date(o.date)).toISOString();
              o.dateTimestamp = new Date(o.date).getTime();
              this.orderService.update(o?.key, o).then(
                () => console.log('Update done', o)
              );
            } else {
              console.log('order without key', o);
            }
          });
        }
      );
  }

  updateDateFilterObject() {
    this.dateFilter = {
      startDate: (new Date(this.oFilter.startDate)).toISOString(),
      endDate: (new Date(this.oFilter.endDate)).toISOString(),
    };
  }

  getLastDataByDate() {
    if (this.dateFilter.startDate !== 'Invalid Date' && this.dateFilter.endDate !== 'Invalid Date') {
      this.utilService.loaded = false;
      this.orderService.getLastData(this.dateFilter)
        .subscribe(
          all => {
            this.all = all;
            this.globalFilter();
          }
        );
    }
  }

  getPreviousWeek(previous: number) {
    this.cnTheoTuan = previous;
    const date = this.orderService.getLastWeek(previous);
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    this.updateDateFilterObject();
    this.getLastDataByDate();
    this.updateDoanhThuLabel(previous);
  }

  updateDoanhThuLabel(number) {
    switch (number) {
      case -1:
        this.doantThuLabel = 'Tuần tới';
        break;
      case 0:
        this.doantThuLabel = 'Tuần này';
        break;
      case 1:
        this.doantThuLabel = 'Tuần trước';
        break;
      case 2:
        this.doantThuLabel = '2 Tuần trước';
        break;
      case 3:
        this.doantThuLabel = '3 Tuần trước';
        break;
      case 4:
        this.doantThuLabel = '4 Tuần trước';
        break;
      default:
        this.doantThuLabel = 'Tuần này';
        break;
    }
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      if (!e?.data?.key) {
        alert('LIÊN HỆ ADMIN ĐỂ XÓA');
        e.confirm.reject();
      } else {
        this.orderService.delete(e?.data?.key)
          .then(() => e.confirm.resolve())
          .catch(() => e.confirm.reject());
      }
    } else {
      e.confirm.reject();
    }
  }

  printOrder(e) {
    this.manualPrint = true;
    this.orderFilter.forEach((o: Order) => {
      if (o?.key === e?.data?.key) {
        o.printed1 = true;
      }
    });
    const dialogRef = this.dialog.open(CartDialog, {
      width: '100%',
      data: {order: e.data},
      position: {top: '10px'},
    });

    dialogRef.afterClosed().subscribe(() => {
    });
  }

  filterByDate(startDate: any, endDate: any) {
    if (!(startDate instanceof Date)) {
      this.orderService.filterStartDate = this.utilService.getDateFromString(startDate.value);
      this.orderService.filterEndDate = this.utilService.getDateFromString(endDate.value);
      this.oFilter.startDate = this.orderService.filterStartDate;
      this.oFilter.endDate = this.orderService.filterEndDate;
      this.updateDateFilterObject();
      this.getLastDataByDate();
    }
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
    this.utilService.loaded = true;
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
