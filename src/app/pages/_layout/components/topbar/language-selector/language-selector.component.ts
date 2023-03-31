import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslationService } from '../../../../../modules/i18n/translation.service';
import {DynamicAsideMenuService} from '../../../../../_metronic/core';
import {CONFIG} from '../../../../../utils/constants';
import {environment} from '../../../../../../environments/environment';

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  language: LanguageFlag;
  languages: LanguageFlag[] = [
    {
      lang: 'vi',
      name: 'Vietnamese',
      flag: './assets/media/svg/flags/220-vietnam.svg',
    },
    {
      lang: 'en',
      name: 'English',
      flag: './assets/media/svg/flags/226-united-states.svg',
    },
    // {
    //   lang: 'es',
    //   name: 'Spanish',
    //   flag: './assets/media/svg/flags/128-spain.svg',
    // },
    // {
    //   lang: 'jp',
    //   name: 'Japanese',
    //   flag: './assets/media/svg/flags/063-japan.svg',
    // },
    // {
    //   lang: 'de',
    //   name: 'German',
    //   flag: './assets/media/svg/flags/162-germany.svg',
    // },
    // {
    //   lang: 'fr',
    //   name: 'French',
    //   flag: './assets/media/svg/flags/195-france.svg',
    // },
  ];
  constructor(
    private translationService: TranslationService,
    private menu: DynamicAsideMenuService,
    private router: Router
  ) {
    let lang = localStorage.getItem(CONFIG.KEY.LOCALIZATION);

    if (!lang) {
      lang = environment.defaultLanguage;
    }

    this.translationService.setLanguage(lang);
  }

  ngOnInit() {
    this.setSelectedLanguage();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event) => {
        this.setSelectedLanguage();
      });
  }

  setLanguageWithRefresh(lang) {
    this.setLanguage(lang);
    this.menu.loadMenu();
    window.location.reload();
  }

  setLanguage(lang) {
    this.languages.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
    this.translationService.setLanguage(lang);
  }

  setSelectedLanguage(): any {
    this.setLanguage(this.translationService.getSelectedLanguage());
  }
}
