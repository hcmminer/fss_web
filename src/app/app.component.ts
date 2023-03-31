import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslationService } from './modules/i18n/translation.service';
// language list
import { locale as enLang } from './modules/i18n/vocabs/en';
import { locale as viLang } from './modules/i18n/vocabs/vi';
import { locale as laLang } from './modules/i18n/vocabs/la';

import { SplashScreenService } from './_metronic/partials/layout/splash-screen/splash-screen.service';
import { Router, NavigationEnd, NavigationError, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableExtendedService } from './_metronic/shared/crud-table';
import { CONFIG } from './utils/constants';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private translationService: TranslationService,
    private splashScreenService: SplashScreenService,
    private router: Router,
    private route: ActivatedRoute,
    private tableService: TableExtendedService
  ) {
    // register translations
    let token = localStorage.getItem(CONFIG.KEY.TOKEN);
    if ((!window.location.pathname.startsWith("/auth") && !window.location.pathname.startsWith("/error"))) {
      if (token) {
        let defaultPage = localStorage.getItem('redirect-default-page');
        let returnUrl =
          window.location.pathname || '/';
        if (returnUrl) {
          let split = returnUrl.split("/");
          if (split.length > 0 && returnUrl != "/") {
            let menuStr = localStorage.getItem('list-menu');
            if (menuStr) {
              let menu = JSON.parse(menuStr);
              if (menu && menu.length > 0) {
                let checkList = menu.filter(x => x.page.toLowerCase().indexOf(split[1].toLowerCase()) >= 0);
                if (checkList && checkList.length > 0 && checkList[0].submenu && split[2]) {
                  // let checkSubList = checkList[0].submenu.filter(x => x.page.toLowerCase().indexOf(split[2].toLowerCase()) >= 0);
                  // if (checkSubList && checkSubList.length > 0) {
                  //   returnUrl = returnUrl != "/" ? returnUrl : defaultPage;
                  // } else {
                  //   returnUrl = defaultPage;
                  // }
                  returnUrl = returnUrl != "/" ? returnUrl : defaultPage; //do web này ko có submenu
                } else {
                  returnUrl = defaultPage;
                }
              } else {
                returnUrl = defaultPage;
              }
            } else {
              returnUrl = defaultPage;
            }
          } else {
            returnUrl = defaultPage;
          }
        } else {
          returnUrl = defaultPage;
        }
        this.router.navigate([returnUrl]);
      }
    } else if ((token && (window.location.pathname.startsWith("/auth") || window.location.pathname.startsWith("/error")))) {
      let defaultPage = localStorage.getItem('redirect-default-page');
      if (defaultPage) {
        this.router.navigate([defaultPage]);
      }
    }
    this.router.getCurrentNavigation();
    this.translationService.loadTranslations(
      enLang,
      viLang,
        laLang
    );
  }

  ngOnInit() {
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // clear filtration paginations and others
        this.tableService.setDefaults();
        // hide splash screen
        this.splashScreenService.hide();

        // scroll to top on every route change
        window.scrollTo(0, 0);

        // to display back the body content
        setTimeout(() => {
          document.body.classList.add('page-loaded');
        }, 500);
      }
    });
    this.unsubscribe.push(routerSubscription);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
