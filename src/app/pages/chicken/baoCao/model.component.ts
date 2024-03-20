import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { take } from 'rxjs/operators';
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
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-smart-table-bao-cao',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class BaoCaoComponent implements OnInit, AfterViewInit, OnDestroy {
  options: any = {};
  themeSubscription: any;
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
  tongHopOrder: Order;
  thuCongNo = true;
  doantThuLabel = 'Tuần này';
  cnTheoTuan = 0;
  congNo = {
    paid: 0,
    unpaid: 0
  };

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
    private theme: NbThemeService,
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
    // Lấy order cho 7 ngày gần nhất
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
    this.updateDoanhThuLabel(previous);
  }

  updateDoanhThuLabel(number) {
    switch (number) {
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
    // Tổng hợp truy thu công nợ
    this.congNo.paid = 0;
    this.congNo.unpaid = 0;
    this.congNoByCustomer.forEach((o: CongNoByCustomer) => {
      this.congNo.paid += o?.paidTotal;
      this.congNo.unpaid += o?.unpaidTotal;
    });
    // Init Graph
    this.initGraph();
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
          congNoBySchool.paid = this.checkThuCongNo(orders);
          congNo.masterTotal += congNoBySchool.total;
          congNo.schools.push(congNoBySchool);
        }
      });
      const paidInfo = this.paidAndUnpaidBySchool(congNo);
      congNo.paidTotal = paidInfo.paid;
      congNo.unpaidTotal = paidInfo.unpaid;
      this.congNoByCustomer.push(congNo);
    });
  }

  paidAndUnpaidBySchool(congNo: CongNoByCustomer) {
    let paid = 0;
    let unpaid = 0;
    congNo.schools.forEach((o: CongNoBySchool) => {
      if (o?.paid) {
        paid += o?.total;
      } else {
        unpaid += o?.total;
      }
    });
    return {
      paid, unpaid
    }
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

  sortByDateAndSchool() {
    this.orderFilter = _.sortBy(this.orderFilter, ['school.key']);
  }

  truyThuCongNo(orders: Order[]) {
    const dataCongNo = {
      orders: orders,
      totalPrice: this.tongTienByOrders(orders),
      time: 'Từ ' + this.datePipe.transform(new Date(this.oFilter.startDate), 'dd/MM/YYYY') +
        '-' + this.datePipe.transform(new Date(this.oFilter.endDate), 'dd/MM/YYYY')
    };
    this.orderService.thuCongNoBySchool = dataCongNo;
    this.utilService.gotoPage('pages/chicken/thu-chi/add/thu');
  }

  checkThuCongNo(orders: Order[]) {
    let chuaThu = true;
    orders.forEach((o: Order) => {
      if (o?.paid === undefined || o?.paid === false) {
        chuaThu = false;
      }
    });
    return chuaThu;
  }


  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  ngAfterViewInit() {
  }

  print() {
    window.print();
  }

  initGraph() {

    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors = config.variables;
      const echarts: any = config.variables.echarts;

      this.options = {
        title: {
          left: '0%',
          text: 'DOANH SỐ THEO SẢN PHẨM',
          subtext: '',
          textAlign: 'left',
        },
        backgroundColor: echarts.bg,
        color: [colors.warningLight, colors.infoLight, colors.dangerLight, colors.successLight, colors.primaryLight],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : SL {c} - ({d}%)',
        },
        legend: {
          data: [],
          textStyle: {
            color: echarts.textColor,
          },
        },
        series: [
          {
            name: 'Countries',
            type: 'pie',
            radius: '80%',
            center: ['50%', '50%'],
            data: [],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: echarts.itemHoverShadowColor,
              },
            },
            label: {
              normal: {
                textStyle: {
                  color: echarts.textColor,
                },
              },
            },
            labelLine: {
              normal: {
                lineStyle: {
                  color: echarts.axisLineColor,
                },
              },
            },
          },
        ],
      };
    });

    console.log('orderFilter', this.orderFilter);
    console.log('tongHopOrder', this.tongHopOrder);
    console.log('orderBySchool', this.orderBySchool);
    console.log('congNoByCustomer', this.congNoByCustomer);
    this.tongHopOrder.item.sort((a, b) => a.qty - b.qty);
    console.log('tongHopOrder', this.tongHopOrder);
    // Báo cáo theo số lượng sản phẩm bán ra
    this.options.legend.orient = 'Tên Sản Phẩm';
    this.options.legend.data = [];
    this.options.series[0].data = [];
    this.tongHopOrder.item.forEach((cart: Cart) => {
      // this.options.legend.data.push(cart?.product?.name);
      const label = '( Bán: ' + cart?.qty + ', Trả: ' + (cart?.qtyReturn || 0) + ')';
      this.options.series[0].data.push({value: (cart.qty - (cart?.qtyReturn || 0)), name: (cart?.product?.name + label) });
    });
    console.log(this.options);

  }

}
