import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { ThuChi, ThuChiService } from '../../../../main/thuChi.service';
import { FileUpload, FileUploadService } from '../../../../main/upload.service';
import { ThuChiType, ThuChiTypeService } from '../../../../main/thuChiType.service';
import { NbToastrService } from '@nebular/theme';
import { NhaCungCap, NhaCungCapService } from '../../../../main/nhaCungCap.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImagePopinDialog } from '../../upload/popin/popin';
import { UtilService } from '../../../../main/util.service';
import { ImageFile } from '../../../directives/dragDrop.directive';
import { Wallet, WalletService } from '../../../../main/wallet.service';

@Component({
  selector: 'ngx-smart-thuchi-edit',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ThuChiEditComponent implements OnInit {
  all?: ThuChi[] = [];
  thuChi: ThuChi = new ThuChi();
  thuChiTypes: ThuChiType[];
  nhaCungCaps: NhaCungCap[];
  nhaCungCap: string;
  thuChiType: string;
  fileUploads: any[] = [];
  fileUploadsNew: any[] = [];
  fileNames: string[] = [];

  source: LocalDataSource = new LocalDataSource();

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;

  today = new Date();
  thuChiId: string;
  thuChiDate = new Date();
  isChi = false;
  thanhToanTypes = this.thuChiTypeService.thanhToanTypes;
  paymentTypes = this.thuChiTypeService.paymentTypes;
  dropFiles: ImageFile[] = [];
  wallets: Wallet[];
  wallet: Wallet;
  oldPrice = 0;
  constructor(
    private service: SmartTableData,
    private modelService: ThuChiService,
    private uploadService: FileUploadService,
    private thuChiTypeService: ThuChiTypeService,
    private toastrService: NbToastrService,
    private nhaCungCapService: NhaCungCapService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private utilService: UtilService,
    private walletService: WalletService,
  ) {
    this.thuChiId = this.activatedRoute.snapshot.paramMap.get('thuChiId');
    this.getAllThuChiType();
    this.getAllNhaCungCap();
    this.getAllUploadFiles();
    this.getAllWallet();
    this.getThuChi();
  }

  initThuChi() {
    this.thuChiDate = new Date(this.thuChi.date);
    this.thuChiType = this.thuChi.thuChiTypeKey;
    this.nhaCungCap = this.thuChi.nhaCungCapKey;
    this.thuChi.note = this.thuChi.note ?? '';
    this.thuChi.fileKeys = this.thuChi.fileKeys ?? [];
    this.thuChi.url = this.thuChi.url ?? '';
    this.thuChi.paymentType = this.thuChi.paymentType ?? this.paymentTypes[0].key;
    this.oldPrice = +this.thuChi.price;
  }

  getThuChi() {
    this.modelService.getThuChiByKey(this.thuChiId)
      .subscribe(thuChi => {
        this.isChi = thuChi.thuChiTypeKey === 'chi';
        this.thuChi = thuChi;
        this.initThuChi();
      });
  }

  getAllWallet() {
    if (!this.walletService.cacheWallets) {
      this.walletService.getAll3().subscribe(all => {
        this.wallets = this.walletService.cacheWallets = all;
      });
    } else {
      this.wallets = this.walletService.cacheWallets;
    }
  }

  getAllThuChiType() {
    this.thuChiTypes = this.thuChiTypeService.thuChiType;
  }

  getAllUploadFiles() {
    if (!this.uploadService.cacheUploadFiles) {
      this.uploadService.getAll3().subscribe(fileUploads => {
        this.fileUploads = this.uploadService.cacheUploadFiles = fileUploads;
      });
    } else {
      this.fileUploads = this.uploadService.cacheUploadFiles;
    }
  }

  getAllNhaCungCap() {
    if (!this.nhaCungCapService.cacheNhaCungCaps) {
      this.nhaCungCapService.getAll3().subscribe(all => {
        this.nhaCungCaps = this.nhaCungCapService.cacheNhaCungCaps = all;
        this.nhaCungCap = this.nhaCungCaps[0].key;
      });
    } else {
      this.nhaCungCaps = this.nhaCungCapService.cacheNhaCungCaps;
      this.nhaCungCap = this.nhaCungCaps[0].key;
    }
  }

  ngOnInit() {
  }

  updateThuChi(event, type) {
    this.thuChi[type] = event?.target?.value ?? event?.value;
  }
  ungTraLuongClick(checked: boolean) {
    this.thuChi.ttLuong = checked;
  }

  showFile(file: FileUpload) {
    if (this.thuChi && this.thuChi.fileKeys) {
      return this.thuChi.fileKeys.includes(file.key);
    }
    return false;
  }

  showImage(imgSrc) {
    this.dialog.open(ImagePopinDialog, {
      width: '100%',
      data: {imgSrc: imgSrc},
    });
  }

  quayLai() {
    this.router.navigate(['pages/chicken/thu-chi']);
  }

  submitThuChi() {
    // Update wallet
    this.updateWallet();
    this.thuChi.updateAt = (new Date()).toString();
    this.thuChi.price = +this.thuChi.price;
    this.modelService.update(this.thuChiId, this.thuChi)
      .then(() => {
        this.utilService.clearCache([this.modelService.lcKey]);
        this.utilService.gotoPage('pages/chicken/thu-chi');
      });
  }

  updateWallet() {
    if (this.thuChi.walletKey && this.thuChi.paymentType) {
      this.wallet = (this.wallets.filter((w: Wallet) => w.key === this.thuChi.walletKey)).shift();
      const price = this.oldPrice - this.thuChi.price;
      this.wallet.bankTotal = +this.wallet.bankTotal;
      this.wallet.cashTotal = +this.wallet.cashTotal;
      let update = false;
      if (this.thuChi.paymentType === 1) {
        // Bank
        if (this.isChi) {
          this.wallet.bankTotal += price;
          update = true;
        } else {
          // Thu
          if (this.thuChi.trangThaiTT === 2) {
            this.wallet.bankTotal -= price;
            update = true;
          }
        }
      } else if (this.thuChi.paymentType === 2) {
        // Cash
        if (this.isChi) {
          this.wallet.cashTotal += price;
          update = true;
        } else {
          // Thu
          if (this.thuChi.trangThaiTT === 2) {
            this.wallet.cashTotal -= price;
            update = true;
          }
        }
      }
      if (update) {
        // Call service to update wallet
        this.walletService.update(this.wallet.key, this.wallet).then(
          () =>
            this.utilService.clearCache([this.walletService.lcKey])
        );
      }
    }
  }

  onDropFiles(dropFiles: ImageFile[]): void {
    this.dropFiles = [...this.dropFiles, ...dropFiles];
    dropFiles.forEach((file: ImageFile) => {
      this.upload(file.file);
    });
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

}
