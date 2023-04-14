import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoaiTaiSanComponent } from './components/loai-tai-san/loai-tai-san.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'type-of-asset', component: LoaiTaiSanComponent },
      { path: '', component: LoaiTaiSanComponent },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanLyTaiSanRoutingModule {}
