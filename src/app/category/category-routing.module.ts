import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { CategoryComponent } from './category.component';

const routes: Routes = [
  { path: "category", component: CategoryComponent },
  { path: "category/add", component: AddComponent },
  { path: "category/edit/:key", component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }
