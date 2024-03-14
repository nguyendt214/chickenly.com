import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LocalDataSource, Ng2SmartTableComponent } from 'ng2-smart-table';

import { SmartTableData } from '../../../../@core/data/smart-table';
import { map } from 'rxjs/operators';
import { CustomerService } from '../../../../main/customer.service';
import { Category, CategoryService } from '../../../../main/category.service';
import { ProductType, ProductTypeService } from '../../../../main/product-type.service';
import { Product, ProductService } from '../../../../main/product.service';
import { Cart, Order, OrderService } from '../../../../main/order.service';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { OrderItemDialog } from '../order-dialog/order-item-dialog.component';
import { UtilService } from '../../../../main/util.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ProductListComponent implements OnInit, OnChanges {
  @Input() products: Product[] = [];
  @Input() order: Order;
  @Input() editOrder = false;
  @Input() orderKey: string = '';
  @Output() deleteProduct: EventEmitter<any> = new EventEmitter();
  @Output() createNewOrder: EventEmitter<any> = new EventEmitter();
  categories?: Category[] = [];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];
  allProducts?: Product[] = [];
  tongHop = {
    tongCom: 0,
    tongComLy: 0,
    tongTien: 0,
    tongSP: 0,
  };
  settings = {
    actions: {
      add: false,
      columnTitle: '',
      delete: true,
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
      categoryName: {
        title: 'Nhóm Sản Phẩm',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.product.category.name;
        },
        editable: false,
        filter: false,
      },
      productName: {
        title: 'Sản Phẩm',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.product.name;
        },
        editable: false,
        filter: false,
      },
      productType: {
        title: 'Qui cách',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<span class="text-center d-block">' + row.product.productType.name + '</span>';
        },
        editable: true,
        filter: false,
      },
      qty: {
        title: 'Số Lượng Giao',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<span class="text-center d-block">' + row.qty + '</span>';
        },
        editable: true,
        filter: false,
      },
      qtyReturn: {
        title: 'Số Lượng Trả',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          if (row.qtyReturn) {
            return '<span class="text-center d-block">' + row.qtyReturn + '</span>';
          }
        },
        filter: false,
      },
      price: {
        title: 'Giá',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return this.currencyPipe.transform(row.price, '', '', '1.0-0') + ' VNĐ';
        },
        editable: true,
        filter: false,
      },
      // customNote: {
      //   title: 'Ghi Chú',
      //   type: 'string',
      //   valuePrepareFunction: (cell, row) => {
      //     return row.customNote ?? row.product.note;
      //   },
      //   editable: true,
      //   filter: false,
      // },
    },
    hideSubHeader: false,
    mode: 'external',
    pager: {
      perPage: 50,
    },
  };
  source: LocalDataSource = new LocalDataSource();
  @ViewChild('table') table: Ng2SmartTableComponent;

  constructor(
    private service: SmartTableData,
    private modelService: ProductService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private orderService: OrderService,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog,
    private utilService: UtilService,
  ) {
  }

  ngOnInit() {
    this.getAllCategories();
    this.getAllProductType();
    this.getAllProducts();
    this.initTable();
    this.utilService.loaded = true;
  }

  initTable() {
    if (this.editOrder) {
      // this.settings.columns.qty.editable = false;
      // this.settings.columns.price.editable = false;
      // this.settings.mode = 'external';
    } else {
      delete this.settings.columns.qtyReturn;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initProducts();
  }

  onEditConfirm(e: any) {
    this.order.item.forEach((item: Cart) => {
      if (item.product.key === e.newData.product.key) {
        item.qty = +e.newData.qty;
        item.price = e.newData.price;
        item.product.note = e.newData.custom ?? item.product.note;
        e.confirm.resolve();
      }
    });
    this.tongHopCart();
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.order.item = this.order.item.filter((item: Cart) => item.product.key !== e.data.product.key);
      if (this.editOrder) {
        this.deleteProduct.emit(e.data.product.key);
      } else {
        this.createNewOrder.emit(this.order);
      }
      // e.confirm.resolve();
    } else {
      e.confirm.reject();
    }
  }

  getAllCategories() {
    if (this.categoryService.cacheCategory) {
      this.categories = this.categoryService.cacheCategory;
    } else {
      this.categoryService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.categories = all;
        this.categoryService.cacheCategory = all;
      });
    }
  }

  getAllProductType() {
    if (this.productTypeService.cacheProductTypes) {
      this.productTypes = this.productTypeService.cacheProductTypes;
    } else {
      this.productTypeService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.productTypes = this.productTypeService.cacheProductTypes = all;
      });
    }
  }

  getAllProducts() {
    if (this.productService.cacheProducts) {
      this.allProducts = this.productService.cacheProducts;
      this.prepareProducts();

    } else {
      this.productService.getAll().snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({key: c.payload.key, ...c.payload.val()}),
          ),
        ),
      ).subscribe(all => {
        this.allProducts = this.productService.cacheProducts = all;
        this.prepareProducts();
      });
    }
  }

  prepareProducts() {
    // Category
    this.allProducts.forEach((p: Product) => {
      p.category = this.categories.find((c: Category) => c.key === p.categoryKey);
    });
    // Product Type
    this.allProducts.forEach((p: Product) => {
      p.productType = this.productTypes.find((pt: ProductType) => pt.key === p.productTypeKey);
    });
    this.allProducts = this.productService.groupProductByCategory(this.allProducts);
  }

  initProducts() {
    if (this.order.item && this.order.item.length) {
      this.order = this.orderService.sortCartByCategory(this.order);
      this.source.load(this.order.item);
      this.tongHopCart();
    }
  }

  tongHopCart() {
    this.tongHop.tongTien = 0;
    this.tongHop.tongCom = 0;
    this.tongHop.tongComLy = 0;
    this.tongHop.tongSP = this.order.item.length;
    let hasCom = false;
    let hasComLy = false;
    this.order.item.forEach((cart: Cart) => {
      this.tongHop.tongTien += cart.price * cart.qty;
      if (cart.categoryKey === this.categoryService.comKey) {
        this.tongHop.tongCom += cart.qty;
        this.tongHop.tongSP--;
        hasCom = true;
      }
      if (cart.categoryKey === this.categoryService.comLyKey) {
        this.tongHop.tongComLy += cart.qty;
        this.tongHop.tongSP--;
        hasComLy = true;
      }
    });
    if (hasCom) {
      this.tongHop.tongSP++;
    }
    if (hasComLy) {
      this.tongHop.tongSP++;
    }
  }

  editPopup(event) {
    const dialogRef = this.dialog.open(OrderItemDialog, {
      width: '100%',
      data: {
        categories: this.categories,
        productTypes: this.productTypes,
        order: this.order,
        products: this.allProducts,
        cart: event.data,
        orderKey: this.orderKey,
      },
      position: {top: '10px'},
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!this.editOrder) {
        this.order = data?.order;
        this.createNewOrder.emit(this.order);
      }
    });
  }

  editProduct(event) {
    this.editPopup(event);
    // this.table.grid.getSelectedRows().forEach((row) => {
    //   this.table.grid.edit(row);
    // });
  }
}
