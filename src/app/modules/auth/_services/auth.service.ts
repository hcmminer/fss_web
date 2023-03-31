/* tslint:disable */
import {Inject, Injectable, Injector, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {catchError, finalize, map, switchMap} from 'rxjs/operators';
import {UserModel} from '../_models/user.model';
import {AuthModel} from '../_models/auth.model';
import {AuthHTTPService} from './auth-http';
import {Router} from '@angular/router';
import {ResponseModel} from '../_models/response.model';
import {CONFIG} from '../../../utils/constants';
import {ToastrService} from 'ngx-toastr';
import {DynamicAsideMenuConfig} from '../../../_metronic/configs/dynamic-aside-menu.config';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private _authLocalStorageToken = CONFIG.KEY.TOKEN;


  get authLocalStorageToken(): string {
    return this._authLocalStorageToken;
  }

  public setAuthLocalStorageToken(value: string) {
    this._authLocalStorageToken = value;
  }

// public fields
  currentUser$: Observable<UserModel>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<any>;
  isLoadingSubject: BehaviorSubject<boolean>;
  user: UserModel;
  responseLogin: any;


  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private translateService: TranslateService,
    @Inject(Injector) private readonly injector: Injector
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<any>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();

  }

  // public methods
  login(username: string, password: string): Observable<any> {
    this.isLoadingSubject.next(true);
    if(username){
      username = username.trim();
    }
    return this.authHttpService.login(username, password).pipe(

       map((response: ResponseModel) => {
        if (response && response.errorCode=="0") {
          return this.setAuthFromLocalStorage(response.data);
        } else {
          this.responseLogin = 'AUTH.ERROR.ERR_API_LOGIN';
          this.toastService.error(
            this.translateService.instant('AUTH.ERROR.LOGIN_FAIL'),
            'Error',
          );
          return;
        }
      }),
      switchMap(() => this.getUserByToken()),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this._authLocalStorageToken);
    localStorage.removeItem(CONFIG.KEY.RESPONSE_BODY_LOGIN);
    localStorage.removeItem(CONFIG.KEY.USER_NAME);
    localStorage.removeItem('list-menu');
    localStorage.removeItem('redirect-default-page');
    this.router.navigate(['/auth/login']);
  }

  // getUserByToken(): Observable<UserModel> {
  //   const token = this.getAuthFromLocalStorage();
  //   if (!token) {
  //     return of(undefined);
  //   }
  //
  //   // this.isLoadingSubject.next(true);
  //   if (this.user) {
  //     this.currentUserSubject = new BehaviorSubject<UserModel>(this.user);
  //   } else {
  //     this.logout();
  //   }
  //   return this.currentUserSubject;
  // }

  getUserByToken(): Observable<any> {
    const authInfo = localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN);
    if (!authInfo || authInfo === '') {
      return of(undefined);
    }

    let auth: {
      userName: any;
    };

    try {
      auth = JSON.parse(authInfo);
    } catch (e) {
    }

    if (!auth || !auth.userName) {
      this.logout();
      return of(undefined);
    }

    this.currentUserSubject = new BehaviorSubject<any>(auth);

    return of(auth);
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(user.email, user.password)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  // private methods
  // private setAuthFromLocalStorage(auth: AuthModel): boolean {
  //   // store auth token in local storage to keep user logged in between page refreshes
  //   if (auth && auth.token) {
  //     localStorage.setItem(this.authLocalStorageToken, auth.token);
  //     this.checkUserPermission(auth.roleCode);
  //     return true;
  //   }
  //   return false;
  // }

  private setAuthFromLocalStorage(auth: any): boolean {
    // store auth token in local storage to keep user logged in between page refreshes
    if (auth && auth.token) {
      localStorage.setItem(this._authLocalStorageToken, auth.token);

        const myJSON = JSON.stringify(auth);
        localStorage.setItem(CONFIG.KEY.RESPONSE_BODY_LOGIN, myJSON);
      if (auth.userName) {
        localStorage.setItem(CONFIG.KEY.USER_NAME, auth.userName);
      }
        // if(auth.provinceCode){
        //   localStorage.setItem('user-province', auth.provinceCode);
        // }
        if (auth.lstMenu) {
         localStorage.setItem('list-menu', JSON.stringify(auth.lstMenu));
         let min = Math.min(...auth.lstMenu.map(item => item.ord));
         let result = auth.lstMenu.filter(item => item.ord == min && item.submenu);
         if(result.length>0){
           let minSub = Math.min(...result[0].submenu.map(item => item.ord));
           let resultSub = result[0].submenu.filter(item => item.ord == minSub);
           if(resultSub.length>0){
             localStorage.setItem('redirect-default-page',resultSub[0].page);
           }else{
            // localStorage.setItem('redirect-default-page',result[0].submenu[0].page);
            //fix do web này không có submenu
            if(result[0].submenu.length > 0) {
              localStorage.setItem('redirect-default-page',result[0].submenu[0].page);
            } else {
              localStorage.setItem('redirect-default-page',result[0].page);
            }
           }
         }else{
           localStorage.setItem('redirect-default-page',auth.lstMenu[0].page);
         }
        }
        this.currentUserSubject = new BehaviorSubject<any>(auth);
        // this.checkUserPermission(auth.roleCode);
      return true;
    }
    return false;
  }

  public getAuthFromLocalStorage(): string {
    try {
      return localStorage.getItem(this._authLocalStorageToken);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  // bo sung role
  checkUserPermission(role) {
    let permission = CONFIG.KEY.USER_PERMISSION;

    if (role === CONFIG.USER_ROLE.CMS_CORP_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_CORP_STAFF;
    } else if ( role === CONFIG.USER_ROLE.CMS_PROV_VICE_PRESIDENT ) {
      permission = CONFIG.USER_ROLE.CMS_PROV_VICE_PRESIDENT;
    }  else if ( role === CONFIG.USER_ROLE.CMS_PROV_INFA_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_PROV_INFA_STAFF;
    }
    //   else if ( role === CONFIG.USER_ROLE.CMS_PROV_TECH_STAFF) {
    //   permission = CONFIG.USER_ROLE.CMS_PROV_TECH_STAFF;
    // }
    else if ( role === CONFIG.USER_ROLE.CMS_BTS_PNO_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_BTS_PNO_STAFF;
    }
    else if ( role === CONFIG.USER_ROLE.CMS_BTS_CND_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_BTS_CND_STAFF;
    }
    else if ( role === CONFIG.USER_ROLE.CMS_BTS_TCCN_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_BTS_TCCN_STAFF;
    }
    else if ( role === CONFIG.USER_ROLE.CMS_BTS_CN_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_BTS_CN_STAFF;
    }
    else if ( role === CONFIG.USER_ROLE.CMS_BTS_GRAND_TC_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_BTS_GRAND_TC_STAFF;
    }
    else if ( role === CONFIG.USER_ROLE.CMS_BTS_NOC_STAFF) {
      permission = CONFIG.USER_ROLE.CMS_BTS_NOC_STAFF;
    }
     else {
      this.logout();
    }
    localStorage.setItem(CONFIG.KEY.USER_PERMISSION, permission);
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
