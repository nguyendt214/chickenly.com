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
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImagePopinDialog } from '../../upload/popin/popin';

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
  ) {
    this.thuChiId = this.activatedRoute.snapshot.paramMap.get('thuChiId');
    this.getAllThuChiType();
    this.getAllNhaCungCap();
    this.getAllUploadFiles();
    this.getThuChi();
  }

  initThuChi() {
    this.thuChiDate = new Date(this.thuChi.date);
    this.thuChiType = this.thuChi.thuChiTypeKey;
    this.nhaCungCap = this.thuChi.nhaCungCapKey;
  }

  getThuChi() {
    this.modelService.getThuChiByKey(this.thuChiId)
      .subscribe(thuChi => {
        this.thuChi = thuChi;
        this.initThuChi();
      });
  }

  getAllThuChiType() {
    if (!this.thuChiTypeService.cacheThuChiType) {
      this.thuChiTypeService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.thuChiTypes = this.thuChiTypeService.cacheThuChiType = all;
        this.thuChiType = this.thuChiTypes[0].key;
      });
    } else {
      this.thuChiTypes = this.thuChiTypeService.cacheThuChiType;
      this.thuChiType = this.thuChiTypes[0].key;
    }
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

  ngOnInit() {
  }

  updateThuChi(event, type) {
    this.thuChi[type] = event.target.value;
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

}
