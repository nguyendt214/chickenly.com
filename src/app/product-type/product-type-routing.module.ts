import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { ProductTypeComponent } from './product-type.component';

const routes: Routes = [
  { path: "product-type", component: ProductTypeComponent },
  { path: "product-type/add", component: AddComponent },
  { path: "product-type/edit/:key", component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductTypeRoutingModule { }
