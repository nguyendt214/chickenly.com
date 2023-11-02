import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddComponent } from './add/add.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KevinMaterialModule } from '../material.module';
import { EditComponent } from './edit/edit.component';
import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';



@NgModule({
  declarations: [
    ProductComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProductRoutingModule,
    KevinMaterialModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [
    ProductComponent,
  ]
})
export class ProductModule { }
