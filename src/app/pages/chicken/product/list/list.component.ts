import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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

  categories?: Category[] = [];
  productTypes?: ProductType[] = [];
  all?: Product[] = [];
  allProducts?: Product[] = [];
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
        editable: false,
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
      customNote: {
        title: 'Ghi Chú',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.customNote ?? row.product.note;
        },
        editable: true,
        filter: false,
      },
    },
    hideSubHeader: false,
    mode: 'inline',
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
  ) {
  }

  ngOnInit() {
    this.getAllCategories();
    this.getAllProductType();
    this.getAllProducts();
    this.initTable();
  }

  initTable() {
    if (this.editOrder) {
      // this.settings.columns.qty.editable = false;
      // this.settings.columns.price.editable = false;
      this.settings.mode = 'external';
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
  }

  onDeleteConfirm(e): void {
    if (window.confirm('CHẮC CHẮN MUỐN XÓA KHÔNG?')) {
      this.order.item.filter((item: Cart) => item.product.key !== e.data.product.key);
      e.confirm.resolve();
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

    dialogRef.afterClosed().subscribe(() => {

    });
  }
  editProduct(event) {
    if (this.editOrder) {
      this.editPopup(event);
    } else {
      this.table.grid.getSelectedRows().forEach((row) => {
        this.table.grid.edit(row);
      });
    }
  }
}
