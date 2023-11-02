import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddComponent } from './add/add.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KevinMaterialModule } from '../material.module';
import { EditComponent } from './edit/edit.component';
import { ProductTypeRoutingModule } from './product-type-routing.module';
import { ProductTypeComponent } from './product-type.component';



@NgModule({
  declarations: [
    ProductTypeComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProductTypeRoutingModule,
    KevinMaterialModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [
    ProductTypeComponent,
  ]
})
export class ProductTypeModule { }
