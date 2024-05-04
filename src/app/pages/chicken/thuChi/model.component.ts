import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map, take } from 'rxjs/operators';
import { ThuChi, ThuChiService } from '../../../main/thuChi.service';
import { FileUpload, FileUploadService } from '../../../main/upload.service';
import { ThuChiType, ThuChiTypeService } from '../../../main/thuChiType.service';
import { NbToastrService } from '@nebular/theme';
import { NhaCungCap, NhaCungCapService } from '../../../main/nhaCungCap.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { UtilService } from '../../../main/util.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { ImagePopinDialog } from '../upload/popin/popin';
import { MatDialog } from '@angular/material/dialog';
import { Wallet, WalletService } from '../../../main/wallet.service';
import { ExportCsvService } from '../../../main/exportCsv.service';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../main/auth.service';

@Component({
  selector: 'ngx-smart-table-school',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ThuChiComponent implements OnInit {
  all?: ThuChi[] = [];
  thuChi: ThuChi = new ThuChi();
  thuChiTypes: ThuChiType[];
  nhaCungCaps: NhaCungCap[];
  nhaCungCapsFilter: NhaCungCap[];
  nhaCungCap: NhaCungCap;
  wallets: Wallet[];
  wallet: Wallet;
  thuChiType: ThuChiType;
  fileUploads: any[] = [];
  fileUploadsNew: any[] = [];
  fileNames: string[] = [];
  thuChiFilter?: ThuChi[] = [];
  tongThu?: ThuChi[] = [];
  tongChi?: ThuChi[] = [];
  tongThuFilter?: ThuChi[] = [];
  tongChiFilter?: ThuChi[] = [];
  price = {
    tienDaThu: 0,
    tienChuaThu: 0,
    chi: 0,
  };
  priceFilter = {
    tienDaThu: 0,
    tienChuaThu: 0,
    chi: 0,
  };

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;

  today = new Date();
  startDate: any;
  endDate: any;
  oFilter: any = {};
  selectThuChiType = '';
  selectNhaCungCap = '';
  isSameDay = false;
  allCustomers: Customer[] = [];
  customers: Customer[] = [];
  cnNcc = 0;
  dateFilter: any = {};
  isAdminRole = this.authService.isAdminRole();
  constructor(
    private service: SmartTableData,
    private thuChiService: ThuChiService,
    private uploadService: FileUploadService,
    private thuChiTypeService: ThuChiTypeService,
    private toastrService: NbToastrService,
    private nhaCungCapService: NhaCungCapService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private utilService: UtilService,
    private customerService: CustomerService,
    private dialog: MatDialog,
    private walletService: WalletService,
    private exportCsvService: ExportCsvService,
    private authService: AuthService,
  ) {
    this.utilService.loaded = false;
    const date = this.thuChiService.getCurrentMonth();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    // this.filterByDate(this.startDate, this.endDate);
    this.getAllInParallel();
  }

  getAllInParallel() {
    this.updateDateFilterObject();
    this.getAllThuChiType();

    forkJoin([
      this.nhaCungCapService.getAll3().pipe(take(1)),
      this.uploadService.getLastData().pipe(take(1)),
      this.customerService.getAll3().pipe(take(1)),
      this.walletService.getAll3().pipe(take(1)),
      this.thuChiService.getLastData(this.dateFilter).pipe(take(1)),
    ]).subscribe(
      (all) => {
        this.nhaCungCaps = this.nhaCungCapService.cacheNhaCungCaps = <NhaCungCap[]>all[0];
        this.nhaCungCapService.storeData(this.nhaCungCaps);
        this.nhaCungCap = this.nhaCungCaps[0].key;
        this.cnNhaCungCap();
        this.nhaCungCapsFilter = this.nhaCungCaps.filter((ncc: NhaCungCap) => ncc.price !== 0);
        this.fileUploads = this.uploadService.cacheUploadFiles = <FileUpload[]>all[1];
        this.uploadService.storeData(this.fileUploads);
        this.customers = this.allCustomers = this.customerService.cacheCustomers = <Customer[]>all[2];
        this.customerService.storeData(this.customers);
        this.wallets = this.walletService.cacheWallets = <Wallet[]>all[3];
        this.walletService.storeData(this.wallets);
        this.wallets.forEach((w: Wallet) => {
          w.cashTotal = +w.cashTotal;
          w.bankTotal = +w.bankTotal;
        });
        this.wallet = this.wallets[0].key;
        this.all = this.thuChiService.cacheThuChi = <ThuChi[]>all[4];
        this.thuChiService.storeCacheData(this.thuChiService.cacheThuChi, this.dateFilter);
        this.utilService.sortListByDate(this.thuChiService.cacheThuChi);
        this.mapCustomer();
        this.mapWallet();
        this.preparePageData(this.all);
        this.initThuChi();
      },
      () => {
      },
      () => this.utilService.loaded = true
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
      this.thuChiService.getLastData(this.dateFilter)
        .subscribe(
          all => {
            this.all = all;
            this.globalFilter();
          }
        );
    }
  }

  cnNhaCungCap() {
    this.nhaCungCaps.forEach((ncc: NhaCungCap) => {
      this.cnNcc += (+ncc.price > 0) ?  +ncc.price : 0;
    });
  }

  preparePageData(all: ThuChi[]) {
    this.thuChiFilter = all;
    // Prepare files
    this.all.forEach((tc: ThuChi) => {
      tc.files = this.fileUploads.filter((file: FileUpload) => {
        const fileKeys = tc?.fileKeys ?? [];
        return fileKeys.includes(file.key)
      });
    });
    this.prepareThuChi();
  }

  prepareThuChi() {
    this.tongThu = this.all.filter((tc: ThuChi) => tc.thuChiTypeKey === 'thu');
    this.tongChi = this.all.filter((tc: ThuChi) => tc.thuChiTypeKey !== 'thu');
    this.tongThu.forEach((tc: ThuChi) => {
      if (tc.trangThaiTT === 1) {
        this.price.tienChuaThu += +tc.price;
      } else if (tc.trangThaiTT === 2) {
        this.price.tienDaThu += +tc.price;
      }
    });
    this.tongChi.forEach((tc: ThuChi) => {
      this.price.chi += +tc.price;
    });
    this.globalFilter();
  }

  forceUpdateDate() {
    this.thuChiService.getAll3()
      .subscribe(
        (o: ThuChi[]) => {
          console.log(o);
          console.log('Total', o.length);
          o.forEach((_o: ThuChi) => {
            if (_o?.key) {
              _o.date = (new Date(_o.date)).toISOString();
              _o.dateTimestamp = new Date(_o.date).getTime();
              this.thuChiService.update(_o?.key, _o).then(
                () => console.log('Update done', _o)
              );
            } else {
              console.log('order without key', _o);
            }
          });
        }
      );
  }

  prepareThuChiFilter() {
    this.tongThuFilter = this.thuChiFilter.filter((tc: ThuChi) => tc.thuChiTypeKey === 'thu');
    this.tongChiFilter = this.thuChiFilter.filter((tc: ThuChi) => tc.thuChiTypeKey !== 'thu');
    this.tongThuFilter.forEach((tc: ThuChi) => {
      if (tc.trangThaiTT === 1) {
        this.priceFilter.tienChuaThu += +tc.price;
      } else if (tc.trangThaiTT === 2) {
        this.priceFilter.tienDaThu += +tc.price;
      }
    });
    this.tongChiFilter.forEach((tc: ThuChi) => {
      this.priceFilter.chi += +tc.price;
    });
  }

  initThuChi() {
    this.thuChi.date = this.today.toISOString();
    this.thuChi.fileKeys = [];
    this.thuChi.thuChiTypeKey = '';
    this.thuChi.nhaCungCapKey = '';
    this.utilService.loaded = true;
  }

  mapWallet() {
    this.all.forEach((tc: ThuChi) => {
      if (tc.walletKey) {
        let c: any = this.wallets.filter((w: Wallet) => w.key === tc.walletKey);
        if (c.length) {
          c = c.shift();
          tc.wallet = c;
        }
      }
      this.mapPaymentType(tc);
    });
  }

  mapPaymentType(tc: ThuChi) {
    let t: any = this.thuChiTypeService.paymentTypes.filter((tt: any) => tt.key === tc.paymentType);
    if (t.length) {
      t = t.shift();
      tc.paymentTypeLabel = t.name;
    }
  }

  mapCustomer() {
    this.all.forEach((tc: ThuChi) => {
      if (tc.thuChiTypeKey === 'thu') {
        let c: any = this.customers.filter((cus: Customer) => cus.key === tc.customerKey);
        if (c.length) {
          c = c.shift();
          tc.customer = c;
        }
      }
      this.mapTrangThaiThanhToan(tc);
    });
  }

  mapTrangThaiThanhToan(tc: ThuChi) {
    let t: any = this.thuChiTypeService.thanhToanTypes.filter((tt: any) => tt.key === tc.trangThaiTT);
    if (t.length) {
      t = t.shift();
      tc.trangThaiLabel = t.name;
    }
  }

  getAllThuChiType() {
    this.thuChiTypes = this.thuChiTypeService.thanhToanTypes;
    this.thuChiType = this.thuChiTypes[0].key;
  }


  ngOnInit() { }

  selectFile(event): void {
    this.selectedFiles = event.target.files;
    this.upload();
  }

  upload(): void {
    const file = this.selectedFiles.item(0);
    this.fileNames.push(file.name);
    this.selectedFiles = undefined;

    this.currentFileUpload = new FileUpload(file);
    this.uploadService.pushFileToStorage(this.currentFileUpload).subscribe(
      percentage => {
        this.percentage = Math.round(percentage);
      },
      error => {
      },
      () => this.getLastUploadFile(),
    );
  }

  createDateChooice(t: string, e: any) {
    this.thuChi.date = e.value.toISOString();
  }

  getLastUploadFile() {
    this.uploadService.getFiles(1).snapshotChanges().pipe(
      map(changes =>
        // store the key
        changes.map(c => ({key: c.payload.key, ...c.payload.val()})),
      ),
    ).subscribe(fileUploads => {
      fileUploads.forEach((f: FileUpload) => {
        if (this.fileNames.includes(f.name) && !this.thuChi.fileKeys.includes(f.key)) {
          this.thuChi.fileKeys.push(f.key);
          this.fileUploadsNew.push(f);
        }
      });
    });
  }

  addItem() {
    this.thuChi.thuChiTypeKey = <string>this.thuChiType;
    this.thuChi.nhaCungCapKey = <string>this.nhaCungCap;
    this.thuChiService.create(this.thuChi).then(
      () => {
        this.thuChi = new ThuChi();
        this.thuChiService.cacheThuChi = null;
        this.utilService.clearCache([this.thuChiService.lcKey]);
        this.initThuChi();
        this.showToa();
        this.getAllInParallel();
      },
    );
  }

  showToa() {
    this.toastrService.show(
      'Tiếp tục nào!!!',
      `THÊM THÀNH CÔNG`,
      {
        status: 'success',
        destroyByClick: true,
        duration: 3000,
        hasIcon: true,
        preventDuplicates: true,
      });
  }

  updateThuChi(event, type) {
    this.thuChi[type] = event.target.value;
  }

  deleteFile(file: FileUpload) {
    this.fileUploadsNew = this.fileUploadsNew.filter((f) => f.key !== file.key);
    this.fileNames = this.fileNames.filter(f => f !== file.name);
    this.thuChi.fileKeys = this.thuChi.fileKeys.filter(i => i !== file.key);
  }

  filterByDate(startDate: any, endDate: any) {
    if (!(startDate instanceof Date)) {
      this.thuChiService.filterStartDate = this.utilService.getDateFromString(startDate.value);
      this.thuChiService.filterEndDate = this.utilService.getDateFromString(endDate.value);
      this.oFilter.startDate = this.thuChiService.filterStartDate;
      this.oFilter.endDate = this.thuChiService.filterEndDate;
      this.isSameDay = this.oFilter.startDate && this.oFilter.endDate &&
        this.thuChiService.filterStartDate.getTime() === this.thuChiService.filterEndDate.getTime();
      this.updateDateFilterObject();
      this.getLastDataByDate();
    }
  }

  globalFilter() {
    // Always filter by date
    this.thuChiFilter = this.all.filter((o: ThuChi) => {
      const orderDate = new Date((new Date(o?.date)).setHours(0, 0, 0, 0));
      return this.thuChiService.filterStartDate <= orderDate && orderDate <= this.thuChiService.filterEndDate;
    });

    if (this.oFilter.thuChiType) {
      this.thuChiFilter = this.thuChiFilter.filter((o: ThuChi) => o.thuChiTypeKey === this.oFilter.thuChiType.key);
    }
    if (this.oFilter.nhaCungCap) {
      this.thuChiFilter = this.thuChiFilter.filter((o: ThuChi) => o.nhaCungCapKey === this.oFilter.nhaCungCap.key);
    }
    this.prepareThuChiFilter();
    this.utilService.loaded = true;
  }

  filterByThuChiType(c: ThuChiType) {
    this.oFilter.thuChiType = c;
    this.globalFilter();
  }

  filterNhaCungCap(c: NhaCungCap) {
    this.oFilter.nhaCungCap = c;
    this.globalFilter();
  }

  resetFilter() {
    this.thuChiService.filterStartDate = null;
    const date = this.thuChiService.getCurrentMonth();
    this.startDate = date[0];
    this.endDate = date[1];
    this.selectThuChiType = '';
    this.selectNhaCungCap = '';
    this.oFilter = {
      startDate: this.startDate,
      endDate: this.endDate,
      thuChiType: null,
      nhaCungCap: null,
    };
    this.globalFilter();
  }

  onCustom(event) {
    if (event.action === 'sua-thu-chi') {
      this.utilService.gotoPage('pages/chicken/thu-chi/edit/' + event.data.key);
    }
  }

  suaKhoanThu(key) {
    this.utilService.gotoPage('pages/chicken/thu-chi/edit/' + key);
  }

  themMoi(type: string) {
    this.utilService.gotoPage('pages/chicken/thu-chi/add/' + type);
  }

  walletTransfer() {
    this.utilService.gotoPage('pages/chicken/wallet/transfer');
  }

  showImage(imgSrc, googleDrive = false) {
    const data = googleDrive ? {imgSrc: imgSrc + '&sz=w500'} : {imgSrc: imgSrc};
    this.dialog.open(ImagePopinDialog, {
      width: '100%',
      data,
    });
  }

  showFile(thuChi: ThuChi, file: FileUpload) {
    if (thuChi && thuChi.fileKeys) {
      return thuChi.fileKeys.includes(file.key);
    }
    return false;
  }

  isChi(type: string): boolean {
    return type === 'chi';
  }

  exportToExcel() {
    const dataExport = {
      date: {
        start: this.datePipe.transform(new Date(this.oFilter.startDate), 'dd-MM-YYYY'),
        end: this.datePipe.transform(new Date(this.oFilter.endDate), 'dd-MM-YYYY'),
      },
      priceFilter: this.priceFilter,
      tongThu: this.tongThu,
      tongChi: this.tongChi,
      wallets: this.wallets,
    };
    let fileName = 'THU-CHI';
    fileName += '-' + this.datePipe.transform(new Date(this.oFilter.startDate), 'dd-MM-YYYY') +
      '-' + this.datePipe.transform(new Date(this.oFilter.endDate), 'dd-MM-YYYY');

    this.exportCsvService.exportThuChi(dataExport, fileName);
  }

  onDeleteConfirm(key: string): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      if (!key) {
        alert('LIÊN HỆ ADMIN ĐỂ XÓA');
        return;
      } else {
        this.thuChiService.delete(key).then(
          () => window.location.reload()
        );
      }
    }
  }

}
