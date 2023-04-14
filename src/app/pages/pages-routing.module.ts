import { QuanLyTaiSanModule } from './quan-ly-tai-san/quan-ly-tai-san.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { AuthGuard } from '../modules/auth/_services/auth.guard';

const routes: Routes = [
  {
    component: LayoutComponent,
    canActivate: [AuthGuard],
    matcher: (url) => {
      return url && url.length ? { consumed: [] } : { consumed: url };
    },
    children: [
      {
        path: 'job-request',
        loadChildren: () =>
          import('./quan-ly-phieu-cong-tac/quan-ly-phieu-cong-tac.module').then((m) => m.QuanLyPhieuCongTacModule),
      },
      {
        path: 'category',
        loadChildren: () => import('./quan-ly-danh-muc/quan-ly-danh-muc.module').then((m) => m.QuanLyDanhMucModule),
      },
      {
        path: 'management-job-request',
        loadChildren: () =>
          import('./quan-ly-lich-trinh/quan-ly-phieu-cong-tac.module').then((m) => m.QuanLyPhieuCongTacModule),
      },
      {
        path: 'basic-construction',
        loadChildren: () =>
          import('./quan-ly-xay-dung-co-ban/quan-ly-xay-dung-co-ban.module').then((m) => m.QuanLyXayDungCoBanModule),
      },
      {
        path: 'asset-manage',
        loadChildren: () => import('./quan-ly-tai-san/quan-ly-tai-san.module').then((m) => m.QuanLyTaiSanModule),
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/error-3',
      },
    ],
  },
];

routes.forEach((element) => {
  let child = element.children;
  let menuStr = localStorage.getItem('list-menu');
  if (menuStr) {
    let menu = JSON.parse(menuStr);
    if (menu && menu.length > 0) {
      element.children?.forEach((element) => {
        if (element && element.path != '' && element.path != '**' && element.path != 'home') {
          let checkList = menu.filter((x) => x.page.toLowerCase().indexOf(element.path.toLowerCase()) >= 0);
          if (!checkList || checkList.length < 1) {
            child = child.filter((x) => x.path != element.path);
          }
        }
      });
      element.children = child;
    } else {
      element.children = [];
    }
  } else {
    element.children = [];
  }
});

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
