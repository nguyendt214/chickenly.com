import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { ProductComponent } from './product.component';

const routes: Routes = [
  { path: "product", component: ProductComponent },
  { path: "product/add", component: AddComponent },
  { path: "product/edit/:key", component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
