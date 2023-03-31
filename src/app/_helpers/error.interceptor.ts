import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../modules/auth';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, public toastrService: ToastrService, private translate: TranslateService,
    public spinner: NgxSpinnerService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err) {
        if (err.status && err.status === 401) {
          this.toastrService.error(this.translate.instant('SESSION_EXPIRED'));
          this.authService.logout();
        }
        if (err.status != undefined && err.status != null && (err.status === 500 || err.status === 400 || err.status === 403 || err.status === 404 || err.status === 405
          || err.status === 406 || err.status === 407 || err.status === 408 || err.status === 409 ||
          err.status === 501 || err.status === 502 || err.status === 503 || err.status === 505 || err.status === 504 || err.status === 0)) {
          this.toastrService.error(this.translate.instant('SYSTEM_ERROR'));
        }
        this.spinner.hide();
        return of(undefined);
      }
    }))
  }
}
