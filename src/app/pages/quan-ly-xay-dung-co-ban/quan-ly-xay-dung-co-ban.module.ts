import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { CommonAlertDialogComponent } from '../common/common-alert-dialog/common-alert-dialog.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuanLyXayDungCoBanRoutingModule } from './quan-ly-xay-dung-co-ban-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { SharedDisplayHtmlModule } from 'src/app/_metronic/shared/shared-display-html/shared-display-html.module';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PreviewPdfComponent } from '../common/preview-pdf/preview-pdf.component';
import { SoDuDauKyComponent } from './so-du-dau-ky/so-du-dau-ky.component';
import { QuanLyXayDungCoBanComponent } from './quan-ly-xay-dung-co-ban.component';
import { FormAddEditSoDuDauKyComponent } from './so-du-dau-ky/form-add-so-du-dau-ky/form-add-edit-so-du-dau-ky.component';
import { PopupMessageComponent } from '../common/popup-message/popup-message.component';
import { MatRadioModule } from '@angular/material/radio';
import { PhatSinhTangComponent } from './phat-sinh-tang/phat-sinh-tang.component';
import { PhatSinhGiamComponent } from './phat-sinh-giam/phat-sinh-giam.component';
import { FormAddEditPhatSinhTangComponent } from './phat-sinh-tang/form-add-edit-phat-sinh-tang/form-add-edit-phat-sinh-tang.component';
import { FormAddEditPhatSinhGiamComponent } from './phat-sinh-giam/form-add-edit-phat-sinh-giam/form-add-edit-phat-sinh-giam.component';

@NgModule({
  imports: [
    CommonModule,
    QuanLyXayDungCoBanRoutingModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    MatIconModule,
    NgbDatepickerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    CRUDTableModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    NgxDropzoneModule,
    SharedDisplayHtmlModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
  ],
  declarations: [
    PopupMessageComponent,
    QuanLyXayDungCoBanComponent,
    SoDuDauKyComponent,
    FormAddEditSoDuDauKyComponent,
    PhatSinhTangComponent,
    PhatSinhGiamComponent,
    FormAddEditPhatSinhTangComponent,
    FormAddEditPhatSinhGiamComponent,
  ],
  exports: [
    PopupMessageComponent,
],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
  ],
})
export class QuanLyXayDungCoBanModule { }
