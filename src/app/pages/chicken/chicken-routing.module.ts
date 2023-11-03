import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmartTableComponent } from './smart-table/smart-table.component';
import { TreeGridComponent } from './tree-grid/tree-grid.component';
import { ChickenComponent } from './chicken.component';

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
];
