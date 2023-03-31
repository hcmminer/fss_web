import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { TabLoTrinhComponent } from './chi-tiet-phieu-cong-tac/components/tab-lo-trinh/tab-lo-trinh.component';
import { TabKhachSanNhaNghiComponent } from './chi-tiet-phieu-cong-tac/components/tab-khach-san-nha-nghi/tab-khach-san-nha-nghi.component';
import { TabFileDinhKemComponent } from './chi-tiet-phieu-cong-tac/components/tab-file-dinh-kem/tab-file-dinh-kem.component';
import { TabChiPhiKhacComponent } from './chi-tiet-phieu-cong-tac/components/tab-chi-phi-khac/tab-chi-phi-khac.component';
import { TabCanBoNhanVienComponent } from './chi-tiet-phieu-cong-tac/components/tab-can-bo-nhan-vien/tab-can-bo-nhan-vien.component';
import { ChiTietPhieuCongTacComponent } from './chi-tiet-phieu-cong-tac/chi-tiet-phieu-cong-tac.component';
import { MatSortModule } from '@angular/material/sort';
import { DanhSachPhieuCongTacComponent } from './danh-sach-phieu-cong-tac/danh-sach-phieu-cong-tac.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuanLyPhieuCongTacComponent } from './quan-ly-phieu-cong-tac.component';
import { QuanLyPhieuCongTacRoutingModule } from './quan-ly-phieu-cong-tac-routing.module';
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
import { TrinhKyVofficeComponent } from './trinh-ky-voffice/trinh-ky-voffice.component';
import { KetThucPhieuCongTacComponent } from './ket-thuc-phieu-cong-tac/ket-thuc-phieu-cong-tac.component';

@NgModule({
  imports: [
    CommonModule,
    QuanLyPhieuCongTacRoutingModule,
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
    MatSelectModule
  ],
  declarations: [
    QuanLyPhieuCongTacComponent,
    DanhSachPhieuCongTacComponent,
    ChiTietPhieuCongTacComponent,
    TabCanBoNhanVienComponent,
    TabChiPhiKhacComponent,
    TabFileDinhKemComponent,
    TabKhachSanNhaNghiComponent,
    TabLoTrinhComponent,
    TrinhKyVofficeComponent,
    KetThucPhieuCongTacComponent
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
  ],
})
export class QuanLyPhieuCongTacModule { }
