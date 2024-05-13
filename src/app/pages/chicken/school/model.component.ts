import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { School, SchoolService } from '../../../main/school.service';
import { Customer, CustomerService } from '../../../main/customer.service';
import { UtilService } from '../../../main/util.service';

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
      printNumber: {
        title: 'Số bản in',
        type: 'string',
      },
      showOrderPrice: {
        title: 'Hiển thị giá',
        type: 'string',
      },
      showQRCode: {
        title: 'Hiển thị QRCode',
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
    private schoolService: SchoolService,
    private customerService: CustomerService,
    private utilService: UtilService,
  ) {
    this.schoolService.getAll3()
      .subscribe(all => {
        this.schoolService.storeData(all);
        this.all = all;
        this.source.load(this.all);
        this.utilService.loaded = true;
    });
  }

  ngOnInit() {
    this.getAllCustomers();
  }

  onCreateConfirm(e: any) {
    this.schoolService.create(e?.newData)
      .then(() => {
        this.utilService.clearCache([this.schoolService.lcKey]);
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    this.schoolService.update(e?.newData?.key, e?.newData)
      .then(() => {
        this.utilService.clearCache([this.schoolService.lcKey]);
        window.location.reload();
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.schoolService.delete(e?.data?.key)
        .then(() => {
          this.utilService.clearCache([this.schoolService.lcKey]);
          e.confirm.resolve();
        })
        .catch(() => e.confirm.reject());
    } else {
      e.confirm.reject();
    }
  }

  getAllCustomers() {
    this.customerService.getAll3().subscribe(all => {
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
