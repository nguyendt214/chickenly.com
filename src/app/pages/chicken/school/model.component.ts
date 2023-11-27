import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { School, SchoolService } from '../../../main/school.service';
import { Customer, CustomerService } from '../../../main/customer.service';

@Component({
  selector: 'ngx-smart-table-school',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class SchoolComponent implements OnInit {
  customers?: Customer[] = [];
  all?: School[] = [];
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
      owner: {
        title: 'Người quản lý',
        valuePrepareFunction: (cell) => {
          const c: Customer = this.customerService.getCustomerByKey(this.customers, cell);
          return c ? c.name : '';
        },
        editor: {
          type: 'list',
          config: {
            list: [],
          },
        },
        sort: true,
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
      phone: {
        title: 'Điện thoại',
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
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private service: SmartTableData,
    private modelService: SchoolService,
    private customerService: CustomerService,
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
    this.getAllCustomers();
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

  getAllCustomers() {
    this.customerService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.customers = all;
      this.customers.forEach((c: Customer) => {
        this.settings.columns.owner.editor.config.list.push({
          value: c.key,
          title: c.name,
        });
      });
      this.settings = Object.assign({}, this.settings);
    });
  }

}
