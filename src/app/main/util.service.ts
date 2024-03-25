import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from "./category.service";
import { CustomerService } from "./customer.service";
import { EmployeeService } from "./employee.service";
import { NhaCungCapService } from "./nhaCungCap.service";
import { OrderService } from "./order.service";
import { ProductService } from "./product.service";
import { ProductTypeService } from "./product-type.service";
import { SchoolService } from "./school.service";
import { ThuChiService } from "./thuChi.service";
import { ThuChiTypeService } from "./thuChiType.service";
import { FileUploadService } from "./upload.service";
import { WalletService } from "./wallet.service";
import { WalletTransferService } from "./walletTransfer.service";
import { LocalStorageService } from "./local-storage.servise";

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(
    private router: Router,
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
  ) {
  }
  googleDriveURL = 'https://drive.google.com/thumbnail?id=';
  loaded = false;
  lastData = true;
  allCacheKeys = [
    this.categoryService.lcKey,
    this.customerService.lcKey,
    this.employeeService.lcKey,
    this.nccService.lcKey,
    this.orderService.lcKey,
    this.productTypeService.lcKey,
    this.productService.lcKey,
    this.schoolService.lcKey,
    this.thuChiService.lcKey,
    this.thuChiTypeService.lcKey,
    this.uploadService.lcKey,
    this.walletService.lcKey,
    this.transferWalletService.lcKey,
  ];
  gotoPage(path: string) {
    this.router.navigate([path]);
  }

  groupItemBy(array, property) {
    const hash = {}, props = property.split('.');
    for (let i = 0; i < array.length; i++) {
      const key = props.reduce(function (acc, prop) {
        return acc && acc[prop];
      }, array[i]);
      if (!hash[key]) hash[key] = [];
      hash[key].push(array[i]);
    }
    return hash;
  }

  getDateWithoutTime(date: Date) {
    return date.setUTCHours(0, 0, 0, 0);
  }

  getDateFromString(dateString: string) {
    const date = dateString.split('/');
    return new Date(date[1] + '/' + date[0] + '/' + date[2]);
  }

  getImageURLFromGoogleDrive(url: string) {
    const id = url.split("/d/")[1];
    return this.googleDriveURL + id.split("/")[0];
  }

  sortListByDate(list: Array<any>) {
    return list.sort((a: any, b: any) => {
      return +new Date(b.date) - +new Date(a.date);
    });
  }
  appLoading() {
    this.loaded = false;
  }
  appLoaded() {
    this.loaded = true;
  }

  clearCache(caches = []) {
    caches.forEach((cacheKey: string) => {
      this.lc.removeItem(cacheKey);
    });
  }


}
