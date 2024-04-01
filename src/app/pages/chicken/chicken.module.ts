import { LOCALE_ID, NgModule } from '@angular/core';
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule, NbCheckboxModule, NbDatepickerModule,
  NbIconModule,
  NbInputModule, NbListModule,
  NbRouteTabsetModule, NbSelectModule, NbStepperModule,
  NbTabsetModule,
  NbTreeGridModule, NbUserModule,
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { ChickenRoutingModule, routedComponents } from './chicken-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { vi } from 'date-fns/locale';
import { NbDateFnsDateModule } from '@nebular/date-fns';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExportCsvService } from '../../main/exportCsv.service';
import { MatRadioModule } from '@angular/material/radio';
import { NgxEchartsModule } from 'ngx-echarts';
import { Angular2SmartTableModule } from 'angular2-smart-table';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    ThemeModule,
    NbTabsetModule,
    NbRouteTabsetModule,
    NbStepperModule,
    NbCardModule,
    NbButtonModule,
    NbListModule,
    NbAccordionModule,
    NbUserModule,
    NbDatepickerModule,
    NbSelectModule,
    NbCheckboxModule,
    NbDateFnsDateModule.forRoot({
      parseOptions: {locale: vi},
      formatOptions: {locale: vi},
    }),
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatBadgeModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,
    CdkAccordionModule,
    MatExpansionModule,
    MatDialogModule,
    ChickenRoutingModule,
    // Ng2SmartTableModule,
    MatRadioModule,
    Angular2SmartTableModule,
    // NgxEchartsModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'vi-VN'},
    CurrencyPipe,
    {provide: LOCALE_ID, useValue: 'en-US'},
    ExportCsvService,
  ],
})
export class ChickenModule {
}
