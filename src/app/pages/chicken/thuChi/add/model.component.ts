import { Component, OnInit } from '@angular/core';
import { SmartTableData } from '../../../../@core/data/smart-table';
import { map, take } from 'rxjs/operators';
import { ThuChi, ThuChiService } from '../../../../main/thuChi.service';
import { FileUpload, FileUploadService } from '../../../../main/upload.service';
import { ThuChiType, ThuChiTypeService } from '../../../../main/thuChiType.service';
import { NbToastrService } from '@nebular/theme';
import { NhaCungCap, NhaCungCapService } from '../../../../main/nhaCungCap.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { UtilService } from '../../../../main/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer, CustomerService } from '../../../../main/customer.service';
import { Order, OrderService } from '../../../../main/order.service';
import { ImageFile } from '../../../directives/dragDrop.directive';
import { Wallet, WalletService } from '../../../../main/wallet.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ngx-smart-thuchi-add',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ThuChiAddComponent implements OnInit {
  all?: ThuChi[] = [];
  thuChi: ThuChi = new ThuChi();
  thuChiTypes: ThuChiType[];
  nhaCungCaps: NhaCungCap[];
  nhaCungCap: string;
  selectNcc: '';
  selectKH: '';
  thuChiType: string;
  fileUploads: any[] = [];
  fileUploadsNew: any[] = [];
  fileNames: string[] = [];
  allCustomers: Customer[] = [];
  customers: Customer[] = [];
  thanhToanTypes = this.thuChiTypeService.thanhToanTypes;
  khoanThu: string = '';
  soTien: number = 0;

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;
  traLuong = false;

  today = new Date();
  isChi = false;
  dropFiles: ImageFile[] = [];
  paymentTypes = this.thuChiTypeService.paymentTypes;
  wallets: Wallet[];
  wallet: Wallet;

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
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private orderService: OrderService,
    private walletService: WalletService,
  ) {
    this.thuChiType = this.activatedRoute.snapshot.paramMap.get('type');
    this.isChi = this.thuChiType === 'chi';
    this.utilService.loaded = false;
    this.getAllInParallel();
  }

  getAllInParallel() {
    this.getAllThuChiType();

    forkJoin([
      this.walletService.getAll3().pipe(take(1)),
      this.customerService.getAll3().pipe(take(1)),
      this.nhaCungCapService.getAll3().pipe(take(1)),
    ]).subscribe(
      (all) => {
        this.wallets = this.walletService.cacheWallets = <Wallet[]>all[0];
        this.customers = this.allCustomers = this.customerService.cacheCustomers = <Customer[]>all[1];
        this.nhaCungCaps = this.nhaCungCapService.cacheNhaCungCaps = <NhaCungCap[]>all[2];
        this.initThuChi();
        this.truyThuCongNo();
      },
      () => {
      },
      () => this.utilService.loaded = true
    );
  }

  truyThuCongNo() {
    // Check if truy thu cong no
    if (this.orderService.truyThuCongNo) {
      const congNo = this.orderService.truyThuCongNo;
      this.selectKH = congNo.order.customer.key;
      this.khoanThu = 'Doanh Thu: ' + congNo.order.school.name + ' ' + congNo.time;
      this.soTien = congNo.totalPrice;
      this.thuChi.price = this.soTien;
      this.thuChi.trangThaiTT = 2;
    } else if (this.orderService.thuCongNoBySchool) {
      const congNo: Order = this.orderService.thuCongNoBySchool.orders[0];
      this.selectKH = congNo.customer.key;
      this.khoanThu = 'Doanh thu: ' + congNo.school.name + ', ' + this.orderService.thuCongNoBySchool.time;
      this.soTien = this.orderService.thuCongNoBySchool.totalPrice;
      this.thuChi.name = this.khoanThu;
      this.thuChi.price = this.soTien;
      this.thuChi.trangThaiTT = 2;
    } else if (this.orderService.thuCongNoByCustomer) {
      this.selectKH = this.orderService.thuCongNoByCustomer.congNoByCustomer.customer.key;
      this.khoanThu = 'Doanh thu: ' + this.orderService.thuCongNoByCustomer.congNoByCustomer.customer.name + ', ' + this.orderService.thuCongNoByCustomer.time;
      this.soTien = this.orderService.thuCongNoByCustomer.totalPrice;
      this.thuChi.name = this.khoanThu;
      this.thuChi.price = this.soTien;
      this.thuChi.trangThaiTT = 2;
    }
  }

  onDropFiles(dropFiles: ImageFile[]): void {
    this.dropFiles = [...this.dropFiles, ...dropFiles];
    dropFiles.forEach((file: ImageFile) => {
      this.upload(file.file);
    });
  }

  initThuChi() {
    this.thuChi.date = this.today.toLocaleDateString();
    this.thuChi.fileKeys = [];
    this.thuChi.thuChiTypeKey = this.thuChiType;
    this.thuChi.nhaCungCapKey = '';
    this.thuChi.ttLuong = false;
    this.thuChi.trangThaiTT = this.isChi ? 2 : 1; // Chưa thanh toán
    this.thuChi.paymentType = 1; // Chuyển khoản
    this.thuChi.walletKey = this.walletService.viCtyKey;
    this.disableAddChi();
  }

  getAllThuChiType() {
    this.thuChiTypes = this.thuChiTypeService.thuChiType;
  }

  ngOnInit() {
  }

  onEditConfirm(e: any) {
    this.thuChiService.update(e?.newData?.key, e?.newData)
      .then(() => {
        this.utilService.clearCache([this.thuChiService.lcKey]);
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.thuChiService.delete(e?.data?.key)
        .then(() => {
          this.utilService.clearCache([this.thuChiService.lcKey]);
          e.confirm.resolve();
        })
        .catch(() => e.confirm.reject());
    } else {
      e.confirm.reject();
    }
  }

  selectFile(event): void {
    this.selectedFiles = event.target.files;
    this.upload();
  }

  upload(file: File = null): void {
    file = file ?? this.selectedFiles.item(0);
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
    this.thuChi.date = e.value.toLocaleDateString();
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
    try {
      this.thuChi.thuChiTypeKey = <string>this.thuChiType;
      if (!this.isChi && this.selectKH) {
        this.thuChi.customerKey = this.selectKH;
      }
      if (this.thuChi.url) {
        this.thuChi.url = this.utilService.getImageURLFromGoogleDrive(this.thuChi.url);
      }
      this.thuChi.price = +this.thuChi.price || 0;
      // Nếu là chi cho đối tác, thì cần cập nhật công nợ cho đối tác
      if (this.selectNcc) {
        this.thuChi.nhaCungCapKey = this.selectNcc;
        const nhaCungCap = this.nhaCungCapService.getNhaCungCapByKey(this.nhaCungCaps, this.selectNcc);
        nhaCungCap.price -= this.thuChi.price;
        this.nhaCungCapService.update(nhaCungCap.key, nhaCungCap);
      }
      // Update order thành đã thu công nợ
      if (this.orderService.truyThuCongNo || this.orderService.thuCongNoBySchool || this.orderService.thuCongNoByCustomer) {
        let orderKeys = [];
        if (this.orderService.truyThuCongNo) {
          orderKeys = this.orderService.truyThuCongNo.order.orderKeys ?? [];
        } else if (this.orderService.thuCongNoBySchool) {
          orderKeys = this.orderService.thuCongNoBySchool.orders.map((order: Order) => order?.key);
        } else if (this.orderService.thuCongNoByCustomer) {
          orderKeys = this.orderService.thuCongNoByCustomer.orderKeys;
        }
        orderKeys.forEach((k: any) => {
          let o: any = this.orderService.cacheOrder.filter((order: Order) => order.key === k);
          if (o.length) {
            o = o.shift();
            o.paid = true;
            o.thuLevel = 1;
            // Update order
            this.orderService.update(k, o);
          }
        });
      }
      console.log(this.thuChi);
      // Update wallet
      this.updateWallet();
      this.thuChiService.create(this.thuChi).then(
        () => {
          console.log('Thu DONE');
          setTimeout(() => {
            this.router.navigate(['pages/chicken/thu-chi']);
          });
        },
      );
    } catch (e) {
      console.log(e);
      alert('CÓ LỖI!!! LIÊN HỆ ADMIN!!!');
    }
  }

  updateWallet() {
    if (this.thuChi.walletKey && this.thuChi.paymentType) {
      this.wallet = (this.wallets.filter((w: Wallet) => w.key === this.thuChi.walletKey)).shift();
      this.wallet.bankTotal = +this.wallet.bankTotal;
      this.wallet.cashTotal = +this.wallet.cashTotal;
      let update = false;
      if (this.thuChi.paymentType === 1) {
        // Bank
        if (this.isChi) {
          this.wallet.bankTotal -= +this.thuChi.price;
          update = true;
        } else {
          // Thu
          if (this.thuChi.trangThaiTT === 2) {
            this.wallet.bankTotal += +this.thuChi.price;
            update = true;
          }
        }
      } else if (this.thuChi.paymentType === 2) {
        // Cash
        if (this.isChi) {
          this.wallet.cashTotal -= +this.thuChi.price;
          update = true;
        } else {
          // Thu
          if (this.thuChi.trangThaiTT === 2) {
            this.wallet.cashTotal += +this.thuChi.price;
            update = true;
          }
        }
      }
      if (update) {
        // Call service to update wallet
        this.walletService.update(this.wallet.key, this.wallet)
          .then(() => this.utilService.clearCache([this.walletService.lcKey]));
      }
    }
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
    if (type === 'fileKeys') {
      this.thuChi.fileKeys.push(event?.target?.value ?? event?.value);
      this.thuChi.fileKeys = [this.thuChi.fileKeys[0]];
    } else {
      this.thuChi[type] = event?.target?.value ?? event?.value;
    }
    this.disableAddChi();
  }

  deleteFile(file: FileUpload) {
    this.fileUploadsNew = this.fileUploadsNew.filter((f) => f.key !== file.key);
    this.fileNames = this.fileNames.filter(f => f !== file.name);
    this.thuChi.fileKeys = this.thuChi.fileKeys.filter(i => i !== file.key);
  }

  onCustom(event) {
    if (event.action === 'sua-thu-chi') {
      this.utilService.gotoPage('pages/chicken/thu-chi/edit/' + event.data.key);
    }
  }
  ungTraLuongClick(checked: boolean) {
    this.thuChi.ttLuong = checked;
  }
  disableAddChi() {
    if (!this.thuChi.name) {
      return true;
    }
    return false;
  }

}
