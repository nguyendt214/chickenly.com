import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
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
import { Observable } from 'rxjs';

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
  selectKH: '';
  thuChiType: string;
  fileUploads: any[] = [];
  fileUploadsNew: any[] = [];
  fileNames: string[] = [];
  allCustomers: Customer[] = [];
  customers: Customer[] = [];
  thanhToanTypes = this.thuChiTypeService.thanhToanTypes;
  tttt = 1;
  khoanThu: string = '';
  soTien: number;

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;
  traLuong = false;

  today = new Date();
  isChi = false;
  dropFiles: ImageFile[] = [];

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
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private orderService: OrderService,
  ) {
    this.thuChiType = this.activatedRoute.snapshot.paramMap.get('type');
    this.isChi = this.thuChiType === 'chi';
    this.getAllThuChiType();
    // this.getAllNhaCungCap();
    // this.getAllUploadFiles();
    if (!this.isChi) {
      this.getAllCustomer();
    }
    this.getAll();
    // Check if truy thu cong no
    if (this.orderService.truyThuCongNo) {
      const congNo = this.orderService.truyThuCongNo;
      this.selectKH = congNo.order.customer.key;
      this.tttt = 2;
      this.khoanThu = 'Công nợ: ' + congNo.order.school.name + ' ' + congNo.time;
      this.soTien = congNo.totalPrice;
      this.thuChi.price = this.soTien;
    }
  }

  onDropFiles(dropFiles: ImageFile[]): void {
    this.dropFiles = [...this.dropFiles, ...dropFiles];
    dropFiles.forEach((file: ImageFile) => {
      this.upload(file.file);
    });
  }

  initThuChi() {
    this.thuChi.date = this.today.toString();
    this.thuChi.fileKeys = [];
    this.thuChi.thuChiTypeKey = this.thuChiType;
    this.thuChi.nhaCungCapKey = '';
    this.thuChi.ttLuong = false;
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
        this.all = this.modelService.cacheThuChi = all;
        this.initThuChi();
      });
    } else {
      this.all = this.modelService.cacheThuChi;
      this.initThuChi();
    }

  }

  getAllThuChiType() {
    this.thuChiTypes = this.thuChiTypeService.thuChiType;
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
    if (!this.isChi) {
      this.thuChi.customerKey = this.selectKH;
    }
    if (this.thuChi.url) {
      this.thuChi.url = this.utilService.getImageURLFromGoogleDrive(this.thuChi.url);
    }
    this.thuChi.trangThaiTT = this.tttt;
    console.log(this.thuChi);
    // Update order thành đã thu công nợ
    if (this.orderService.truyThuCongNo) {
      const orderKeys = this.orderService.truyThuCongNo.order.orderKeys ?? [];
      orderKeys.forEach((k: any) => {
        let o: any = this.orderService.cacheOrder.filter((order: Order) => order.key === k);
        if (o.length) {
          o = o.shift();
          o.paid = true;
          // Update order
          this.orderService.update(k, o);
        }
      });
    }
    this.modelService.create(this.thuChi).then(
      () => {
        this.modelService.cacheThuChi = null;
        setTimeout(() => {
          this.router.navigate(['pages/chicken/thu-chi']);
        });
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

  onCustom(event) {
    if (event.action === 'sua-thu-chi') {
      this.utilService.gotoPage('pages/chicken/thu-chi/edit/' + event.data.key);
    }
  }
  ungTraLuongClick(checked: boolean) {
    this.thuChi.ttLuong = checked;
  }

}
