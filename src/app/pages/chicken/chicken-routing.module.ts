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
import { OrderEdit2Component } from './order/editOrder/order.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { AuthGuard } from '../../main/guard/auth.guard';

const routes: Routes = [{
  path: '',
  component: ChickenComponent,
  children: [
    {
      path: 'order',
      component: OrderComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'order/:orderId',
      component: EditOrderComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'order/edit/:orderId',
      component: OrderEdit2Component,
      canActivate: [AuthGuard]
    },
    {
      path: 'order-list',
      component: OrderListComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'cong-no',
      component: CongNoComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'customer',
      component: CustomerComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'school',
      component: SchoolComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'category',
      component: CategoryComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'product-type',
      component: ProductTypeComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'product',
      component: ProductComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'employee',
      component: EmployeeComponent,
      canActivate: [AuthGuard]
    },
    {
      path: '',
      redirectTo: 'cong-no',
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
  OrderEdit2Component,
  ProductListComponent,
  OrderItemDialog,
  CartDialog,
  BepDialog,
  SignInComponent,
  SignOutComponent,
];
