import { MatRadioModule } from '@angular/material/radio';
import { AddEditTabDinhMucDiChuyenComponent } from './components/add-edit-tab-dinh-muc-di-chuyen/add-edit-tab-dinh-muc-di-chuyen.component';
import { TabDinhMucDiChuyenComponent } from './components/tab-dinh-muc-di-chuyen/tab-dinh-muc-di-chuyen.component';
import { TabQuanLyKhachSanComponent } from './components/tab-quan-ly-khach-san/tab-quan-ly-khach-san.component';
import { TabQuanLyCongTacPhiComponent } from './components/tab-quan-ly-cong-tac-phi/tab-quan-ly-cong-tac-phi.component';
import { TabQuanLyLoTrinhComponent } from './components/tab-quan-ly-lo-trinh/tab-quan-ly-lo-trinh.component';
import { QuanLyDanhMucComponent } from './quan-ly-danh-muc.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbModalModule, NgbDatepickerModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { SharedDisplayHtmlModule } from 'src/app/_metronic/shared/shared-display-html/shared-display-html.module';
import { QuanLyDanhMucRoutingModule } from './quan-ly-danh-muc-routing.module';
import { AddEditTabQuanLyCongTacPhiComponent } from './components/add-edit-tab-quan-ly-cong-tac-phi/add-edit-tab-quan-ly-cong-tac-phi.component';
import { TabStaffsManagerComponent } from './components/tab-staffs-manager/tab-staffs-manager.component';
import { AddEditStaffsManagerComponent } from './components/add-edit-tab-staffs-manager/add-edit-tab-staffs-manager.component';
import { TabDepartmentsManagerComponent } from './components/tab-departments-manager/tab-departments-manager.component';
import { AddEditTabDepartmentsManagerComponent } from './components/add-edit-tab-departments-manager/add-edit-tab-departments-manager.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    QuanLyDanhMucComponent,
    TabQuanLyLoTrinhComponent,
    TabQuanLyCongTacPhiComponent,
    TabQuanLyKhachSanComponent,
    TabDinhMucDiChuyenComponent,
    TabStaffsManagerComponent,
    AddEditTabQuanLyCongTacPhiComponent,
    AddEditTabDinhMucDiChuyenComponent,
    AddEditStaffsManagerComponent,
    TabDepartmentsManagerComponent,
    AddEditTabDepartmentsManagerComponent,
  ],
  providers: [NgbActiveModal, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  imports: [
    CommonModule,
    QuanLyDanhMucRoutingModule,
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
    MatRadioModule,
  ],
})
export class QuanLyDanhMucModule {}
