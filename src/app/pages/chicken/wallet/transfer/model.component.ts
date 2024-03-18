import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';

import { SmartTableData } from '../../../../@core/data/smart-table';
import { MainService } from '../../../../main/main.service';
import { Customer, CustomerService } from '../../../../main/customer.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { Product, ProductService } from '../../../../main/product.service';
import { Wallet, WalletService } from '../../../../main/wallet.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ThuChiService } from '../../../../main/thuChi.service';
import { ThuChiTypeService } from '../../../../main/thuChiType.service';
import { WalletTransfer, WalletTransferService } from '../../../../main/walletTransfer.service';
import { UtilService } from '../../../../main/util.service';

@Component({
  selector: 'ngx-smart-table-customer',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class WalletTransferComponent implements OnInit {
  all?: Wallet[] = [];
  allWallets?: Wallet[] = [];
  allWalletTransfer?: WalletTransfer[] = [];
  categories: Category[] = [];
  productTypes: ProductType[] = [];
  products: Product[] = [];
  currenCustomerKey: string;
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
        title: 'Ngày',
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
      name: {
        title: 'Tên',
        type: 'string',
      },
      soTien: {
        title: 'Số Tiền ( VNĐ )',
        type: 'number',
        valuePrepareFunction: (cell, row) => {
          return this.currencyPipe.transform(cell, '', '', '1.0-0');
        },
        editable: true,
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
    noDataMessage: 'Không thấy Giao Dịch nào!',
    actions: {
      add: false,
      delete: true,
      edit: true,
    }
  };
  source: LocalDataSource = new LocalDataSource();

  paymentTypes = this.thuChiTypeService.paymentTypes;
  transferWallet: WalletTransfer = new WalletTransfer();

  constructor(
    private service: SmartTableData,
    private mainService: MainService,
    private walletTransferService: WalletTransferService,
    private walletService: WalletService,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private currencyPipe: CurrencyPipe,
    private thuChiTypeService: ThuChiTypeService,
    private datePipe: DatePipe,
    private utilService: UtilService,
  ) {
  }

  ngOnInit() {
    this.getAllWallets();
    this.initPageData();
  }

  initPageData() {
    this.walletTransferService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      this.allWalletTransfer = all;
      this.source.load(this.allWalletTransfer);
      this.transferWallet.soTien = 0;
      this.utilService.loaded = true;
    });

  }

  getAllWallets() {
    this.walletService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    ).subscribe(all => {
      all.forEach((w: Wallet) => {
        w.cashTotal = +w.cashTotal;
        w.bankTotal = +w.bankTotal;
      });
      this.all = this.allWallets = all;
    });
  }


  onCreateConfirm(e: any) {
    this.walletTransferService.create(e?.newData)
      .then(() => {
      })
      .catch(() => e.confirm.reject());
  }

  onEditConfirm(e: any) {
    this.walletTransferService.update(e?.newData?.key, e?.newData)
      .then(() => {
        this.transferWallet = Object.assign({}, e?.newData);
        this.transferWallet.soTien = +e?.newData.soTien - +e?.data?.soTien;
        this.transferWallet.fromWallet = this.walletService.getWalletByKey(this.allWallets, this.transferWallet.fromWalletKey);
        this.transferWallet.toWallet = this.walletService.getWalletByKey(this.allWallets, this.transferWallet.toWalletKey);
        this.updateWallet();
      })
      .catch(() => e.confirm.reject());
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.walletTransferService.delete(e?.data?.key)
        .then(() => e.confirm.resolve())
        .catch(() => e.confirm.reject());
    } else {
      e.confirm.reject();
    }
  }

  updateTransfer(event, type) {
    if (type === 'soTien') {
      this.transferWallet.soTien = +event.target.value;
    } else {
      this.transferWallet[type] = event?.target?.value ?? event?.value;
    }
  }

  selectWallet(even: any, type: string) {
    if (type === 'from') {
      this.transferWallet.fromWallet = this.walletService.getWalletByKey(this.allWallets, even.value);
      this.transferWallet.fromWalletKey = this.transferWallet.fromWallet.key;
    } else {
      this.transferWallet.toWallet = this.walletService.getWalletByKey(this.allWallets, even.value);
      this.transferWallet.toWalletKey = this.transferWallet.toWallet.key;
    }
  }

  transfer() {
    this.transferWallet.date = (new Date()).toString();
    this.transferWallet.soTien = +this.transferWallet.soTien;
    this.transferWallet.name = this.transferWallet.paymentType === 1 ? 'BANK ' : 'CASH ';
    this.transferWallet.name += this.transferWallet.fromWallet.name + ' => ' + this.transferWallet.toWallet.name
    // Add new transfer
    this.walletTransferService.create(this.transferWallet);
    // Update Wallet
    this.updateWallet();
  }

  updateWallet() {
    // Nếu chuyển cùng ví
    if (this.transferWallet.fromWalletKey === this.transferWallet.toWalletKey) {
      if (this.transferWallet.paymentType === 1) {
        // Bank
        this.transferWallet.fromWallet.cashTotal -= this.transferWallet.soTien;
        this.transferWallet.toWallet.bankTotal += this.transferWallet.soTien;
      } else if (this.transferWallet.paymentType === 2) {
        // Cash
        this.transferWallet.fromWallet.bankTotal -= this.transferWallet.soTien;
        this.transferWallet.toWallet.cashTotal += this.transferWallet.soTien;
      }
    } else {
      if (this.transferWallet.paymentType === 1) {
        // Bank
        this.transferWallet.fromWallet.bankTotal -= this.transferWallet.soTien;
        this.transferWallet.toWallet.bankTotal += this.transferWallet.soTien;
      } else if (this.transferWallet.paymentType === 2) {
        // Cash
        this.transferWallet.fromWallet.cashTotal -= this.transferWallet.soTien;
        this.transferWallet.toWallet.cashTotal += this.transferWallet.soTien;
      }
    }
    this.walletService.update(this.transferWallet.fromWallet.key, this.transferWallet.fromWallet);
    this.walletService.update(this.transferWallet.toWallet.key, this.transferWallet.toWallet)
      .then(() => {
        window.location.reload();
      });
  }
}
