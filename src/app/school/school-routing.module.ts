import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { SchoolComponent } from './school.component';

const routes: Routes = [
  { path: "school", component: SchoolComponent },
  { path: "school/add", component: AddComponent },
  { path: "school/edit/:key", component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolRoutingModule { }
