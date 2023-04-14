import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuanLyTaiSanRoutingModule } from './quan-ly-tai-san-routing.module';
import { LoaiTaiSanComponent } from './components/loai-tai-san/loai-tai-san.component';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg';
import { TranslateModule } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { AddEditLoaiTaiSanComponent } from './components/loai-tai-san/add-edit-loai-tai-san/add-edit-loai-tai-san.component';
import { SharedDisplayHtmlModule } from 'src/app/_metronic/shared/shared-display-html/shared-display-html.module';

@NgModule({
  declarations: [LoaiTaiSanComponent, AddEditLoaiTaiSanComponent],
  imports: [
    CommonModule,
    QuanLyTaiSanRoutingModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbModalModule,
    MatDatepickerModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatRadioModule,
    SharedDisplayHtmlModule
  ],
  providers: [NgbActiveModal, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class QuanLyTaiSanModule {}
