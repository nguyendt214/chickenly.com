import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChickenComponent } from './chicken.component';
import { CustomerComponent } from './customer/model.component';
import { CategoryComponent } from './category/model.component';
import { ProductTypeComponent } from './product-type/model.component';
import { SchoolComponent } from './school/model.component';
import { ProductComponent } from './product/model.component';
import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';
import { EmployeeComponent } from './employee/model.component';
import { OrderComponent } from './order/order.component';
import { ProductListComponent } from './product/list/list.component';
import { CartDialog } from './order/cart-dialog/cart-dialog.component';
import { OrderListComponent } from './order-list/model.component';
import { BepDialog } from './order/don-hang-cho-bep-dialog/bep-dialog.component';
import { EditOrderComponent } from './order/edit/order.component';
import { CongNoComponent } from './cong-no/model.component';
import { OrderItemDialog } from './product/order-dialog/order-item-dialog.component';

const routes: Routes = [{
  path: '',
  component: ChickenComponent,
  children: [
    {
      path: 'order',
      component: OrderComponent,
    },
    {
      path: 'order/:orderId',
      component: EditOrderComponent,
    },
    {
      path: 'order-list',
      component: OrderListComponent,
    },
    {
      path: 'cong-no',
      component: CongNoComponent,
    },
    {
      path: 'customer',
      component: CustomerComponent,
    },
    {
      path: 'school',
      component: SchoolComponent,
    },
    {
      path: 'category',
      component: CategoryComponent,
    },
    {
      path: 'product-type',
      component: ProductTypeComponent,
    },
    {
      path: 'product',
      component: ProductComponent,
    },
    {
      path: 'employee',
      component: EmployeeComponent,
    },
    {
      path: '',
      redirectTo: 'customer',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChickenRoutingModule { }

export const routedComponents = [
  ChickenComponent,
  CustomerComponent,
  SchoolComponent,
  CategoryComponent,
  ProductTypeComponent,
  ProductComponent,
  EmployeeComponent,
  OrderComponent,
  OrderListComponent,
  CongNoComponent,
  EditOrderComponent,
  ProductListComponent,
  OrderItemDialog,
  CartDialog,
  BepDialog,
];
