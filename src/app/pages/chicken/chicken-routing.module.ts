import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmartTableComponent } from './smart-table/smart-table.component';
import { TreeGridComponent } from './tree-grid/tree-grid.component';
import { ChickenComponent } from './chicken.component';
import { CustomerComponent } from './customer/model.component';
import { CategoryComponent } from './category/model.component';
import { ProductTypeComponent } from './product-type/model.component';
import { SchoolComponent } from './school/model.component';
import { ProductComponent } from './product/model.component';
import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';

const routes: Routes = [{
  path: '',
  component: ChickenComponent,
  children: [
    {
      path: 'smart-table',
      component: SmartTableComponent,
    },
    {
      path: 'tree-grid',
      component: TreeGridComponent,
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
  SmartTableComponent,
  TreeGridComponent,
  CustomerComponent,
  SchoolComponent,
  CategoryComponent,
  ProductTypeComponent,
  ProductComponent,
];
