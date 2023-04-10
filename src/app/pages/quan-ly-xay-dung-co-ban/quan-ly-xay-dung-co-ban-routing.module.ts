import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoDuDauKyComponent } from './so-du-dau-ky/so-du-dau-ky.component';
import { QuanLyXayDungCoBanComponent } from './quan-ly-xay-dung-co-ban.component';

const routes: Routes = [
  {
    path: '',
    component: QuanLyXayDungCoBanComponent,
    children: [
      { path: 'opening-balance', component: SoDuDauKyComponent},
      { path: '', component: SoDuDauKyComponent },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanLyXayDungCoBanRoutingModule {}
