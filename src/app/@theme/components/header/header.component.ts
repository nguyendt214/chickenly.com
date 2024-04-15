import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { AuthService } from '../../../main/auth.service';
import { UtilService } from "../../../main/util.service";
import { CategoryService } from "../../../main/category.service";
import { CustomerService } from "../../../main/customer.service";
import { EmployeeService } from "../../../main/employee.service";
import { NhaCungCapService } from "../../../main/nhaCungCap.service";
import { OrderService } from "../../../main/order.service";
import { ProductService } from "../../../main/product.service";
import { ProductTypeService } from "../../../main/product-type.service";
import { SchoolService } from "../../../main/school.service";
import { ThuChiService } from "../../../main/thuChi.service";
import { ThuChiTypeService } from "../../../main/thuChiType.service";
import { FileUploadService } from "../../../main/upload.service";
import { WalletService } from "../../../main/wallet.service";
import { WalletTransferService } from "../../../main/walletTransfer.service";
import { LocalStorageService } from "../../../main/local-storage.servise";
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'dark';

  userMenu = [{title: 'Profile'}, {title: 'Log out'}];
  isLogged = false;
  taiLaiLabel = 'TẢI LẠI DỮ LIỆU!';

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              private authService: AuthService,
              private utilService: UtilService,
              private categoryService: CategoryService,
              private customerService: CustomerService,
              private employeeService: EmployeeService,
              private nccService: NhaCungCapService,
              private orderService: OrderService,
              private productService: ProductService,
              private productTypeService: ProductTypeService,
              private schoolService: SchoolService,
              private thuChiService: ThuChiService,
              private thuChiTypeService: ThuChiTypeService,
              private uploadService: FileUploadService,
              private walletService: WalletService,
              private transferWalletService: WalletTransferService,
              private lc: LocalStorageService,
              private router: Router,
  ) {
    this.isLogged = this.authService.isLogged();
    // this.reloadLabel();
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => this.user = users.nick);

    const {xl} = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({name}) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  loadAllData(forceLoad = false) {
    const url = this.router.url;
    switch (url) {
      case '/pages/chicken/thu-chi':
        this.utilService.clearCache([this.thuChiService.lcKey, this.nccService.lcKey, this.transferWalletService.lcKey, this.walletService.lcKey]);
        break;
      case '/pages/chicken/wallet/transfer':
        this.utilService.clearCache([this.transferWalletService.lcKey, this.walletService.lcKey]);
        break;
      case '/pages/chicken/nha-cung-cap':
        this.utilService.clearCache([this.nccService.lcKey]);
        break;
      case '/pages/chicken/employee':
        this.utilService.clearCache([this.employeeService.lcKey]);
        break;
      case '/pages/chicken/product-type':
        this.utilService.clearCache([this.productTypeService.lcKey]);
        break;
      case '/pages/chicken/product':
        this.utilService.clearCache([this.productService.lcKey, this.customerService.lcKey]);
        break;
      case '/pages/chicken/category':
        this.utilService.clearCache([this.categoryService.lcKey]);
        break;
      case '/pages/chicken/school':
        this.utilService.clearCache([this.schoolService.lcKey, this.customerService.lcKey]);
        break;
      case '/pages/chicken/customer':
        this.utilService.clearCache([this.customerService.lcKey]);
        break;
      case '/pages/chicken/doanh-thu':
      case '/pages/chicken/order-list':
        this.utilService.clearCache([this.orderService.lcKey]);
        break;
      default:
        break;
    }
    console.log(this.router.url);
    window.location.reload();
  }

  reloadLabel() {
    const url = this.router.url;
    switch (url) {
      case '/pages/chicken/thu-chi':
        this.taiLaiLabel = 'TẢI LẠI THU CHI';
        break;
      case '/pages/chicken/wallet/transfer':
        this.taiLaiLabel = 'TẢI LẠI TRANSFER';
        break;
      case '/pages/chicken/nha-cung-cap':
        this.taiLaiLabel = 'TẢI LẠI NHÀ CUNG CẤP';
        break;
      case '/pages/chicken/employee':
        this.taiLaiLabel = 'TẢI LẠI NHÂN VIÊN';
        break;
      case '/pages/chicken/product-type':
        this.taiLaiLabel = 'TẢI LẠI LOẠI SẢN PHẨM';
        break;
      case '/pages/chicken/product':
        this.taiLaiLabel = 'TẢI LẠI SẢN PHẨM';
        break;
      case '/pages/chicken/category':
        this.taiLaiLabel = 'TẢI LẠI NHÓM SẢN PHẨM';
        break;
      case '/pages/chicken/school':
        this.taiLaiLabel = 'TẢI LẠI ĐỊA ĐIỂM';
        break;
      case '/pages/chicken/customer':
        this.taiLaiLabel = 'TẢI LẠI KHÁCH HÀNG';
        break;
      case '/pages/chicken/doanh-thu':
      case '/pages/chicken/order-list':
        this.taiLaiLabel = 'TẢI LẠI DOANH THU';
        break;
      default:
        break;
    }
  }

  loadAllOrder() {
    this.utilService.appLoaded();
  }
}
