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

  export class openingBalanceService {
    subscriptions: Subscription[] = [];
    getErrOpeningBalanceFile = new BehaviorSubject<any>({});//v
    getSuccessOpeningBalanceFile = new BehaviorSubject<any>({});
    cbxOrganisation = new BehaviorSubject<any[]>([]);
    listOpeningBalance = new BehaviorSubject<any[]>([]);
    errOpeningBalanceList = new BehaviorSubject<any[]>([]);
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
      getListOrganisation(query: RequestApiModelOld, redirectFunction, allowDefault: boolean) {
        const request = this.globalService
          .globalApi(query, redirectFunction)
          .pipe(
            map((response) => {
              if (response.errorCode != '0') {
                this.cbxOrganisation.next([]);
                throw new Error(response.description);
              }
              if (typeof response.data !== 'undefined' && response.data !== null) {
                this.cbxOrganisation.next(response.data);
              } else {
                this.cbxOrganisation.next([]);
              }
              if (allowDefault)
                this.cbxOrganisation.value.unshift({
                  code: '',
                  name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
                });
            }),
            catchError((err) => {
              // this.toastrService.error(err.error?.message || err.message, 'Error');
              return of(undefined);
            }),
            finalize(() => { }),
          )
          .subscribe();
        this.subscriptions.push(request);
      }
}
