import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { MainService } from '../../../main/main.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { NhaCungCap, NhaCungCapService } from '../../../main/nhaCungCap.service';
import { UtilService } from '../../../main/util.service';
import { Cart } from '../../../main/order.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'ngx-smart-table-nhacc',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class NhaCungCapComponent implements OnInit {
  all?: NhaCungCap[] = [];
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
      name: {
        title: 'Tên',
        type: 'string',
      },
      phone: {
        title: 'Số Điện Thoại',
        type: 'string',
      },
      address: {
        title: 'Địa chỉ',
        type: 'string',
      },
      price: {
        title: 'Công nợ (VNĐ)',
        valuePrepareFunction: (cell, row) => {
          return this.currencyPipe.transform(+cell ?? 0, '', '', '1.0-0');
        },
        filter: false,
      },
      note: {
        title: 'Ghi Chú',
        type: 'string',
      },
    },
    pager: {
      perPage: 50,
    },
    noDataMessage: 'Không thấy Nhà Cung Cấp nào!',
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private mainService: MainService,
    private modelService: NhaCungCapService,
    private dialog: MatDialog,
    private utilService: UtilService,
    private currencyPipe: CurrencyPipe,
  ) {
    this.modelService.getAll3().subscribe(all => {
      this.modelService.storeData(all);
      this.all = all;
      this.source.load(this.all);
      this.utilService.loaded = true;
    });
  }

  ngOnInit() {
  }

  onCreateConfirm(e: any) {
    const ncc = e?.newData;
    ncc.price = +ncc?.price ?? 0;
    this.modelService.create(ncc)
      .then(() => {
        this.utilService.clearCache([this.modelService.lcKey]);
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    const ncc = e?.newData;
    ncc.price = +ncc?.price ?? 0;
    this.modelService.update(e?.newData?.key, ncc)
      .then(() => {
        this.utilService.clearCache([this.modelService.lcKey]);
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.modelService.delete(e?.data?.key)
        .then(() => {
          this.utilService.clearCache([this.modelService.lcKey]);
          e.confirm.resolve();
        })
        .catch(() => e.confirm.reject());
    } else {
      e.confirm.reject();
    }
  }
}
