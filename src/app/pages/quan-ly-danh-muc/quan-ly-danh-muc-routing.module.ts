import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuanLyDanhMucComponent } from './quan-ly-danh-muc.component';

const routes: Routes = [
  {
    path: '',
    // component: QuanLyDanhMucComponent,
    children: [
      { path: 'search', component: QuanLyDanhMucComponent},
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanLyDanhMucRoutingModule {}
