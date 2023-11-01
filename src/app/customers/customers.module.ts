import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers/customers.component';
import { CustomersRoutingModule } from './customers-routing.module';
import { AddComponent } from './add/add.component';
import { ListComponent } from './list/list.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KevinMaterialModule } from '../material.module';
import { EditComponent } from './edit/edit.component';



@NgModule({
  declarations: [
    CustomersComponent,
    AddComponent,
    ListComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CustomersRoutingModule,
    KevinMaterialModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [
    CustomersComponent,
  ]
})
export class CustomersModule { }
