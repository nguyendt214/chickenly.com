import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
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
    chi: 0
  };
  priceFilter = {
    tienDaThu: 0,
    tienChuaThu: 0,
    chi: 0
  };
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
      thuChiTypeKey: {
        title: 'LOẠI',
        valuePrepareFunction: (cell) => {
          const c: ThuChiType = this.thuChiTypeService.getThuChiTypeByKey(this.thuChiTypes, cell);
          return c ? c.name : '';
        },
        editor: {
          type: 'list',
          config: {
            list: [],
          },
        },
        sort: false,
        sortDirection: 'asc',
        compareFunction: (direction: any, c1: string, c2: string) => {
          if (c1 < c2) {
            return -1 * direction;
          }
          if (c1 > c2) {
            return direction;
          }
          return 0;
        },
      },
      nhaCungCapKey: {
        title: 'NHÀ CUNG CẤP',
        valuePrepareFunction: (cell) => {
          const c: NhaCungCap = this.nhaCungCapService.getNhaCungCapByKey(this.nhaCungCaps, cell);
          return c ? c.name : '';
        },
        editor: {
          type: 'list',
          config: {
            list: [],
          },
        },
        sort: false,
        sortDirection: 'asc',
        compareFunction: (direction: any, c1: string, c2: string) => {
          if (c1 < c2) {
            return -1 * direction;
          }
          if (c1 > c2) {
            return direction;
          }
          return 0;
        },
      },
      name: {
        title: 'Tên',
        type: 'string',
      },
      price: {
        title: '(VNĐ)',
        valuePrepareFunction: (cell, row) => {
          return this.currencyPipe.transform(cell, '', '', '1.0-0');
        },
      },
      note: {
        title: 'Ghi Chú',
      },
    },
    pager: {
      perPage: 550,
    },
    actions: {
      edit: false,
      add: false,
      delete: true,
      custom: [
        {
          name: 'sua-thu-chi',
          title: '<span class="custom-action">CHI TIẾT</span>',
        },
      ],
      columnTitle: '',
    },
  };

  source: LocalDataSource = new LocalDataSource();

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

  constructor(
    private service: SmartTableData,
    private modelService: ThuChiService,
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
  ) {
    this.getAllThuChiType();
    this.getAllNhaCungCap();
    this.getAllUploadFiles();
    this.getAllCustomer();
    this.getAllWallet();
    this.getAll();
    this.initThuChi();
  }

  preparePageData(all: ThuChi[]) {
    this.thuChiFilter = all;
    this.source.load(this.all);
    const date = this.modelService.getCurrentMonth();
    this.startDate = date[0];
    this.endDate = date[1];
    this.oFilter.startDate = this.startDate;
    this.oFilter.endDate = this.endDate;
    this.filterByDate(this.startDate, this.endDate);
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
    this.thuChi.date = this.today.toString();
    this.thuChi.fileKeys = [];
    this.thuChi.thuChiTypeKey = '';
    this.thuChi.nhaCungCapKey = '';
  }

  getAll() {
    if (!this.modelService.cacheThuChi) {
      this.modelService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        all.forEach((tc: ThuChi) => {
          tc.price = +tc.price;
        });
        all = this.utilService.sortListByDate(all);
        this.all = this.modelService.cacheThuChi = all;
        this.mapCustomer();
        this.mapWallet();
        this.preparePageData(this.all);
      });
    } else {
      this.all = this.modelService.cacheThuChi;
      this.mapCustomer();
      this.mapWallet();
      this.preparePageData(this.all);
    }

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

  getAllUploadFiles() {
    if (!this.uploadService.cacheUploadFiles) {
      this.uploadService.getAll().snapshotChanges().pipe(
        map(changes =>
          // store the key
          changes.map(c => ({key: c.payload.key, ...c.payload.val()})),
        ),
      ).subscribe(fileUploads => {
        this.fileUploads = this.uploadService.cacheUploadFiles = fileUploads;
      });
    } else {
      this.fileUploads = this.uploadService.cacheUploadFiles;
    }
  }

  getAllNhaCungCap() {
    if (!this.nhaCungCapService.cacheNhaCungCaps) {
      this.nhaCungCapService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.nhaCungCaps = this.nhaCungCapService.cacheNhaCungCaps = all;
        this.nhaCungCap = this.nhaCungCaps[0].key;
      });
    } else {
      this.nhaCungCaps = this.nhaCungCapService.cacheNhaCungCaps;
      this.nhaCungCap = this.nhaCungCaps[0].key;
    }
  }

  getAllWallet() {
    if (!this.walletService.cacheWallets) {
      this.walletService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        all.forEach((w: Wallet) => {
          w.cashTotal = +w.cashTotal;
          w.bankTotal = +w.bankTotal;
        });
        this.wallets = this.walletService.cacheWallets = all;
        this.wallet = this.wallets[0].key;
      });
    } else {
      this.wallets = this.walletService.cacheWallets;
      this.wallets.forEach((w: Wallet) => {
        w.cashTotal = +w.cashTotal;
        w.bankTotal = +w.bankTotal;
      });
      this.wallet = this.wallets[0].key;
    }
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

  onDeleteConfirm(key: string): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.modelService.delete(key)
        .then(() => {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch(() => {
        });
    }
  }

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
    this.thuChi.date = e.value.toString();
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
    this.modelService.create(this.thuChi).then(
      () => {
        this.thuChi = new ThuChi();
        this.modelService.cacheThuChi = null;
        this.initThuChi();
        this.showToa();
        this.getAll();
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
      this.modelService.filterStartDate = this.utilService.getDateFromString(startDate.value);
      this.modelService.filterEndDate = this.utilService.getDateFromString(endDate.value);
      this.oFilter.startDate = this.modelService.filterStartDate;
      this.oFilter.endDate = this.modelService.filterEndDate;
      this.isSameDay = this.oFilter.startDate && this.oFilter.endDate &&
        this.modelService.filterStartDate.getTime() === this.modelService.filterEndDate.getTime();
    }
    this.globalFilter();
  }

  globalFilter() {
    // Always filter by date
    this.thuChiFilter = this.all.filter((o: ThuChi) => {
      const orderDate = new Date((new Date(o?.date)).setHours(0, 0, 0, 0));
      return this.modelService.filterStartDate <= orderDate && orderDate <= this.modelService.filterEndDate;
    });

    if (this.oFilter.thuChiType) {
      this.thuChiFilter = this.thuChiFilter.filter((o: ThuChi) => o.thuChiTypeKey === this.oFilter.thuChiType.key);
    }
    if (this.oFilter.nhaCungCap) {
      this.thuChiFilter = this.thuChiFilter.filter((o: ThuChi) => o.nhaCungCapKey === this.oFilter.nhaCungCap.key);
    }
    this.source.load(this.thuChiFilter);
    this.prepareThuChiFilter();
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
    this.modelService.filterStartDate = null;
    const date = this.modelService.getCurrentMonth();
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
      });
    }
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

}
