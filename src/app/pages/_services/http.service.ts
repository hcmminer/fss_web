import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ResponseModel} from '../_models/response.model';
import {CONFIG} from '../../utils/constants';
import {AuthService} from '../../modules/auth';
import {ToastrService} from 'ngx-toastr';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HTTPService {
  initHeader: {};
  checkError = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient, private authService: AuthService,
              private toastrService: ToastrService) {
    const token = localStorage.getItem(CONFIG.KEY.TOKEN);
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    this.initHeader = {
      Authorization: `Bearer ${token}`,
      'Accept-Language': language,
    };
  }

  // public methods
  post(url: string, data: {}, headers: {}, params?: {}, responseType?, observe?): Observable<ResponseModel> {
    headers = {
      ...headers,
      ...this.initHeader
    };

    return this.http.post<ResponseModel>(url, data, { 
        headers: new HttpHeaders(headers), 
        observe: observe, 
        params: params, 
        responseType: responseType 
      }).pipe(
      map((response: any) => {
        if (response.errorCode == '2') {
          this.toastrService.error('Phiên của bạn đã hết hạn, vui lòng đăng nhập lại');
          this.authService.logout();
          window.location.href = 'auth/login';
        }
        return response;
      }),
      catchError(error => {
        if (this.checkError.value == false) {
          this.toastrService.error('Lỗi khi call API');
        }
        this.checkError.next(true);
        return of([]);
      })
    );
  }

  get(url: string, params: {}, headers: {}): Observable<ResponseModel> {
    headers = {
      ...headers,
      ...this.initHeader
    };

    return this.http.get<ResponseModel>(url, {
      headers: new HttpHeaders(headers),
      params
    });
  }

  getReport(url: string, params: {}, headers: {}): Observable<string> {
    headers = {
      ...headers,
      ...this.initHeader
    };

    return this.http.get<string>(url, {
      headers: new HttpHeaders(headers),
      params
    });
  }
}
