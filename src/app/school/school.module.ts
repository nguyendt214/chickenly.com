import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddComponent } from './add/add.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KevinMaterialModule } from '../material.module';
import { EditComponent } from './edit/edit.component';
import { SchoolComponent } from './school.component';
import { SchoolRoutingModule } from './school-routing.module';



@NgModule({
  declarations: [
    SchoolComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SchoolRoutingModule,
    KevinMaterialModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [
    SchoolComponent,
  ]
})
export class SchoolModule { }
