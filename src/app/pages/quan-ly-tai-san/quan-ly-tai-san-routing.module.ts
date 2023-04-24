import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoaiTaiSanComponent } from './components/loai-tai-san/loai-tai-san.component';
import { TransferAssetComponent } from './components/transfer-asset/transfer-asset.component'; 
import { ImportIncreaseAssetComponent } from './components/import-increase-asset/import-increase-asset.component'; 
import { QuanLyTaiSanComponent } from './quan-ly-tai-san.component';
import { LiquidateAssetComponent } from './components/iquidate-asset/liquidate-asset.component';
import { ReportAssetComponent } from './components/report-asset/report-asset.component';

const routes: Routes = [
  {
    path: '', component: QuanLyTaiSanComponent,
    children: [
      { path: 'type-of-asset', component: LoaiTaiSanComponent },
      { path: 'transfer-asset', component: TransferAssetComponent },
      { path: 'import-increase', component: ImportIncreaseAssetComponent }, 
      { path: 'liquidate-asset', component: LiquidateAssetComponent }, 
      { path: 'report', component: ReportAssetComponent }, 
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
