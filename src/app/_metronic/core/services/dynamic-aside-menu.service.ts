import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicAsideMenuConfig } from '../../configs/dynamic-aside-menu.config';
import {TranslateService} from '@ngx-translate/core';
import {CONFIG} from '../../../utils/constants';

const emptyMenuConfig = {
  items: []
};

@Injectable({
  providedIn: 'root'
})
export class DynamicAsideMenuService {
  private menuConfigSubject = new BehaviorSubject<any>(emptyMenuConfig);
  menuConfig$: Observable<any>;
  constructor(
    private translateService: TranslateService
  ) {
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    DynamicAsideMenuConfig.items = JSON.parse(localStorage.getItem('list-menu'));
    translateService.setDefaultLang(language);
    this.menuConfig$ = this.menuConfigSubject.asObservable();
    this.loadMenu();
  }

  // Here you able to load your menu from server/data-base/localStorage
  // Default => from DynamicAsideMenuConfig
  public loadMenu() {
    DynamicAsideMenuConfig.items.map(item => {
      if (!item.code) {
        return;
      }
      // item.title = this.translateService.instant(`${item.code}.TITLE`);

      if (item.submenu ) {
        // @ts-ignore
        if (item.submenu.length === 0){
          item.submenu = !item.submenu;
        } else {
          item.submenu.map(subItem => {
            if (!subItem.code) {
              return;
            }

            subItem.title = this.translateService.instant(`${subItem.code}.TITLE`);
          });
        }
      }
    });
    this.setMenu(DynamicAsideMenuConfig);
  }

  private setMenu(menuConfig) {
    this.menuConfigSubject.next(menuConfig);
  }

  private getMenu(): any {
    return this.menuConfigSubject.value;
  }
}
