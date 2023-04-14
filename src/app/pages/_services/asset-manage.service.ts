import { Injectable } from "@angular/core";
import { BehaviorSubject, Subscription, of } from "rxjs";
import { RequestApiModelOld } from '../_models/requestOld-api.model';
import { HTTPService } from "./http.service";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "./common.service";
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient } from "@angular/common/http";
import { GlobalService } from "./global.service";
import { CONFIG } from "src/app/utils/constants";
import { catchError, finalize, map } from "rxjs/operators";

@Injectable({
    providedIn: 'root',
  })

  export class AssetManageService {
    subscriptions: Subscription[] = [];
    cbxTypeOfAsset = new BehaviorSubject<any[]>([]);
    initHeader: {};
    header = {
        'Content-Type': 'application/json',
      };
    constructor(
        private httpService: HTTPService,
        private toastrService: ToastrService,
        public translateService: TranslateService,
        private commonService: CommonService,
        public spinner: NgxSpinnerService,
        private httpClient: HttpClient,
        private globalService: GlobalService,
      ) {
        const token = localStorage.getItem(CONFIG.KEY.TOKEN);
        const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
        this.initHeader = {
          Authorization: `Bearer ${token}`,
          'Accept-Language': language,
          ...this.header,
        };
      }
      getCbxTypeOfAsset(query: RequestApiModelOld, redirectFunction, allowDefault: boolean) {
        const request = this.globalService
          .globalApi(query, redirectFunction)
          .pipe(
            map((response) => {
              if (response.errorCode != '0') {
                this.cbxTypeOfAsset.next([]);
                throw new Error(response.description);
              }
              if (typeof response.data !== 'undefined' && response.data !== null) {
                this.cbxTypeOfAsset.next(response.data);
              } else {
                this.cbxTypeOfAsset.next([]);
              }
              if (allowDefault)
                this.cbxTypeOfAsset.value.unshift({
                  code: '',
                  name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
                });
            }),
            catchError((err) => {
              return of(undefined);
            }),
            finalize(() => { }),
          )
          .subscribe();
        this.subscriptions.push(request);
      }
}
