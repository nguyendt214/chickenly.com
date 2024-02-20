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
import { Order } from '../../../main/order.service';
import { Customer } from '../../../main/customer.service';
import { School } from '../../../main/school.service';

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
  thuChiType: ThuChiType;
  fileUploads: any[] = [];
  fileUploadsNew: any[] = [];
  fileNames: string[] = [];
  thuChiFilter?: ThuChi[] = [];
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
      perPage: 50,
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
  ) {
    this.getAllThuChiType();
    this.getAllNhaCungCap();
    this.getAllUploadFiles();
    this.getAll();
    this.initThuChi();
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
        this.all = this.modelService.cacheThuChi = all;
        this.preparePageData(this.all);
      });
    } else {
      this.all = this.modelService.cacheThuChi;
      this.preparePageData(this.all);
    }

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

  themMoi() {
    this.utilService.gotoPage('pages/chicken/thu-chi/add');
  }

}
