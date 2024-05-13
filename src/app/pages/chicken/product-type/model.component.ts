import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'angular2-smart-table';

import { SmartTableData } from '../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { ProductType, ProductTypeService } from '../../../main/product-type.service';
import { UtilService } from '../../../main/util.service';

@Component({
  selector: 'ngx-smart-table-product-type',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ProductTypeComponent implements OnInit {
  all?: ProductType[] = [];
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
    private modelService: ProductTypeService,
    private utilService: UtilService,
  ) {
    this.modelService.getAll3()
      .subscribe(all => {
        this.modelService.storeData(all);
        this.all = all;
        this.source.load(this.all);
        this.utilService.loaded = true;
    });
  }

  ngOnInit() {
  }

  onCreateConfirm(e: any) {
    const oProductType = e?.newData;
    oProductType.note = oProductType?.note ?? '';
    this.modelService.create(oProductType)
      .then(() => {
        this.utilService.clearCache([this.modelService.lcKey]);
        window.location.reload();
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    this.modelService.update(e?.newData?.key, e?.newData)
      .then(() => {
        this.utilService.clearCache([this.modelService.lcKey]);
        window.location.reload();
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
