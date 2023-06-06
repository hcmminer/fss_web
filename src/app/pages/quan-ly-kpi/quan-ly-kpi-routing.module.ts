import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuanLyKpiComponent } from './quan-ly-kpi.component';
import { BoTieuChiComponent } from './components/bo-tieu-chi/bo-tieu-chi.component';

const routes: Routes = [
  {
    path: '',
    component: QuanLyKpiComponent,
    children: [
      {
        path: 'kpi-manager-category',
        component: BoTieuChiComponent,
      },

      { path: '', component: BoTieuChiComponent },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuanLyKpiRoutingModule {}
