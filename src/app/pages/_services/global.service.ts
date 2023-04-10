import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { CONFIG } from '../../utils/constants';
import { HTTPService } from './http.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestApiModel } from '../_models/request-api.model';
import { environment } from '../../../environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import { RequestApiModelOld } from '../_models/requestOld-api.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);

  header = {
    // 'Content-Type': 'application/json'
    'Accept-Language': localStorage.getItem(CONFIG.KEY.LOCALIZATION),
    Authorization: 'Bearer ' + localStorage.getItem(CONFIG.KEY.TOKEN),
  };
  constructor(
    private translateService: TranslateService,
    public httpService: HTTPService,
    public toastrService: ToastrService,
    public http: HttpClient,
    public spinner: NgxSpinnerService,
  ) {}
  get authListFunction(): any {
    const listFunction = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN)).listFunction?.map((item) => item.url);
    return listFunction;
  }
  globalApi(request: RequestApiModelOld, redirectFunction: String): Observable<any> {
    const functionNeedCheck = redirectFunction;
    //  test api nên luôn true
    if (true || this.authListFunction.includes(functionNeedCheck)) {
      Object.assign(request, { userName: localStorage.getItem(CONFIG.KEY.USER_NAME) });
      if (!request.isNotShowSpinner) this.spinner.show();
      const url = `${environment.apiUrl}/` + redirectFunction;
      switch (request.method?.toUpperCase()) {
        case 'GET':
          return this.httpService.get(url, request, { headers: new HttpHeaders(this.header) }).pipe(
            catchError((err) => {
              this.toastrService.error(err.error?.message || err.message);
              if (!request.isNotShowSpinner) this.spinner.hide();
              return of(undefined);
            }),
            finalize(() => {
              this.isLoading.next(false);
              if (!request.isNotShowSpinner) this.spinner.hide();
            }),
          );
        default:
          return this.httpService
            .post(
              url,
              request.formData ? request.formData : request,
              { headers: new HttpHeaders(this.header) },
              request.formData ? request.params : null,
              request.responseType ? request.responseType : null,
              request.observe ? request.observe : null,
            )
            .pipe(
              catchError((err) => {
                this.toastrService.error(err.error?.message || err.message);
                if (!request.isNotShowSpinner) this.spinner.hide();
                return of(undefined);
              }),
              finalize(() => {
                this.isLoading.next(false);
                if (!request.isNotShowSpinner) this.spinner.hide();
              }),
            );
      }
      // .post(
      //   url,
      //   request.formData ? request.formData : request.params,
      //   { headers: new HttpHeaders(this.header) },
      //   request.formData ? request.params : null,
      //   request.responseType ? request.responseType : null,
      //   request.observe ? request.observe : null,
      // )
    } else {
      this.toastrService.warning(this.translateService.instant('RE_LOGIN'));
    }
  }
}
