import { Observable } from 'rxjs/Observable';
import { CONFIG } from 'src/app/utils/constants';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { HTTPService } from './http.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestApiModel } from '../_models/request-api.model';
import { environment } from 'src/environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);

  header = {
    // 'Content-Type': 'application/json'
    'Accept-Language': localStorage.getItem(CONFIG.KEY.LOCALIZATION),
    Authorization: 'Bearer ' + localStorage.getItem(CONFIG.KEY.TOKEN),
  };
  constructor(public httpService: HTTPService, public toastrService: ToastrService, public http: HttpClient, public spinner: NgxSpinnerService) {}

  callAPICommon(request: RequestApiModel): Observable<any> {
    if (!request.isNotShowSpinner) this.spinner.show();
    let userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    let roleCode = userRes.roleCode;
    let userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    Object.assign(request.params, {
      userName: userName,
      roleCode: roleCode,
    });

    const url = `${environment.apiUrl}/${request.functionName}`;
    switch (request.method.toUpperCase()) {
      case 'POST':
        return this.httpService
          .post(
            url,
            request.formData ? request.formData : request.params,
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

      case 'GET':
        return this.httpService.get(url, request.params, { headers: new HttpHeaders(this.header) }).pipe(
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
  }
}
