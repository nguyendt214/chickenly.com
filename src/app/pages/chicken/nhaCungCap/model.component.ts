import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { MainService } from '../../../main/main.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { NhaCungCap, NhaCungCapService } from '../../../main/nhaCungCap.service';

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
  ) {
    this.modelService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.all = all;
      this.source.load(this.all);
    });
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
}
