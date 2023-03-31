import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {QuanLyPhieuCongTacComponent} from './quan-ly-phieu-cong-tac.component';
import {DanhSachPhieuCongTacComponent} from './danh-sach-phieu-cong-tac/danh-sach-phieu-cong-tac.component';

const routes: Routes = [
  {
    path: '',
    component: QuanLyPhieuCongTacComponent,
    children: [
      { path: 'search', component: DanhSachPhieuCongTacComponent},
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanLyPhieuCongTacRoutingModule {}
