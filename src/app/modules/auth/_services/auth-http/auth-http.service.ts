import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../../_models/user.model';
import { environment } from '../../../../../environments/environment';
import {CONFIG} from '../../../../utils/constants';
import {ResponseModel} from '../../_models/response.model';

const API_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  // public methods
  login(username: string, password: string): Observable<ResponseModel> {
    // tslint:disable-next-line:max-line-length
    return this.http.post<ResponseModel>(`${API_URL}/loginAuthentication`, {functionName: 'loginAuthentication', userName : username, password }, {headers: {'Accept-Language': localStorage.getItem(CONFIG.KEY.LOCALIZATION) }, withCredentials: true});
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(API_URL, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_URL}/forgot-password`, {
      email,
    });
  }

  getUserByToken(token): Observable<ResponseModel> {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ResponseModel>(`${API_URL}/me`, {
      headers: httpHeaders,
    });
  }
}
