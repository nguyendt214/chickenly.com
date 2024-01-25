import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { MainService } from '../../../main/main.service';
import { map } from 'rxjs/operators';
import { Employee, EmployeeService } from '../../../main/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-smart-table-employee',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class EmployeeComponent implements OnInit {
  all?: Employee[] = [];
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
  };

  source: LocalDataSource = new LocalDataSource();

  toaConfig = {};

  constructor(
    private service: SmartTableData,
    private mainService: MainService,
    private modelService: EmployeeService,
    private dialog: MatDialog,
    private toastrService: NbToastrService,
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
    // console.log(full.join(' '));
    // const cutFirst = full.slice(0, 8);
    // const cutLast = full.slice(-4);
    // const reverseA = full.reverse();
    // console.log(reverseA.join(' '));
    // this.perms(cutLast).forEach(item => {
    //   console.log(cutFirst.join(' ') + ' ' + item.join(' '));
    // });
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

  toastrConfig() {
    this.toaConfig = {
      status: 'success',
      destroyByClick: true,
      duration: 3000,
      hasIcon: true,
      position: 'bottom-right',
      preventDuplicates: true,
    };
  }

  showToa() {
    this.toastrService.show(
      'Tiếp tục nào!!!',
      `Tạo ĐƠN HÀNG THÀNH CÔNG`,
      this.toaConfig);
  }

  perms(xs) {
    if (!xs.length) return [[]];
    return xs.flatMap(x => {
      // get permutations of xs without x, then prepend x to each
      return this.perms(xs.filter(v => v !== x)).map(vs => [x, ...vs]);
    });
    // or this duplicate-safe way, suggested by @M.Charbonnier in the comments
    // return xs.flatMap((x, i) => {
    //   return perms(xs.filter((v, j) => i!==j)).map(vs => [x, ...vs]);
    // });
    // or @user3658510's variant
    // return xs.flatMap((x, i) => {
    //   return perms([...xs.slice(0,i),...xs.slice(i+1)]).map(vs => [x,...vs]);
    // });
  }
}
