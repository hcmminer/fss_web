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
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg';
import { TranslateModule } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { AddEditLoaiTaiSanComponent } from './components/loai-tai-san/add-edit-loai-tai-san/add-edit-loai-tai-san.component';
import { SharedDisplayHtmlModule } from 'src/app/_metronic/shared/shared-display-html/shared-display-html.module';
import { TransferAssetComponent } from './components/transfer-asset/transfer-asset.component';
import { FormAddTransferAssetComponent } from './components/transfer-asset/form-add-transfer-asset/form-add-transfer-asset.component';
import { ImportIncreaseAssetComponent } from './components/import-increase-asset/import-increase-asset.component';
import { FormAddImportIncreaseAssetComponent } from './components/import-increase-asset/form-add-import-increase-asset/form-add-import-increase-asset.component';
import { QuanLyTaiSanComponent } from './quan-ly-tai-san.component';
import { OpenDepComponent } from './components/open-dep/open-dep.component';
import { AeOpenDepComponent } from './components/open-dep/ae-open-dep/ae-open-dep.component';

import { LiquidateAssetComponent } from './components/iquidate-asset/liquidate-asset.component';
import { FormAddLiquidateAssetComponent } from './components/iquidate-asset/form-add-iquidate-asset/form-add-liquidate-asset.component';
import { ReportAssetComponent } from './components/report-asset/report-asset.component';
import { ViewHisOpenDepComponent } from './components/open-dep/view-his-open-dep/view-his-open-dep.component';
import { DetailImportIncreaseAssetComponent } from './components/import-increase-asset/detail-import-increase-asset/detail-import-increase-asset.component';

@NgModule({
  declarations: [
    QuanLyTaiSanComponent,
    LoaiTaiSanComponent,
    AddEditLoaiTaiSanComponent,
    TransferAssetComponent,
    FormAddTransferAssetComponent,
    ImportIncreaseAssetComponent,
    FormAddImportIncreaseAssetComponent,
    OpenDepComponent,
    AeOpenDepComponent,
    LiquidateAssetComponent,
    FormAddLiquidateAssetComponent,
    ReportAssetComponent,
    ViewHisOpenDepComponent,
    DetailImportIncreaseAssetComponent],
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
    SharedDisplayHtmlModule,
    MatNativeDateModule,
  ],
  providers: [NgbActiveModal, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class QuanLyTaiSanModule { }
