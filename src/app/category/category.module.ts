import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddComponent } from './add/add.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KevinMaterialModule } from '../material.module';
import { EditComponent } from './edit/edit.component';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from './category.component';



@NgModule({
  declarations: [
    CategoryComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CategoryRoutingModule,
    KevinMaterialModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [
    CategoryComponent,
  ]
})
export class CategoryModule { }
