import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Subscription, Observable, of} from 'rxjs';
import {catchError, first} from 'rxjs/operators';
import {UserModel} from '../_models/user.model';
import {AuthService} from '../_services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {TranslateService} from '@ngx-translate/core';
import {DynamicAsideMenuConfig} from '../../../_metronic/configs/dynamic-aside-menu.config';
import {CONFIG} from '../../../utils/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // // defaultAuth = {
  // //   email: '',
  // //   password: '',
  // // };
  // defaultAuth: any = {
  //   username: 'admin',
  //   password: '123456',
  // };
  // loginForm: FormGroup;
  // hasError: boolean;
  // returnUrl: string;
  // isLoading$: Observable<boolean>;
  //
  // // private fields
  // private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  //
  // constructor(
  //   private fb: FormBuilder,
  //   private authService: AuthService,
  //   private route: ActivatedRoute,
  //   private router: Router
  // ) {
  //   this.isLoading$ = this.authService.isLoading$;
  //   // redirect to home if already logged in
  //   if (this.authService.currentUserValue) {
  //     this.router.navigate(['/']);
  //   }
  // }
  //
  // ngOnInit(): void {
  //   this.initForm();
  //   // get return url from route parameters or default to '/'
  //   this.returnUrl =
  //       this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  //   }
  //
  // // convenience getter for easy access to form fields
  // get f() {
  //   return this.loginForm.controls;
  // }
  //
  // initForm() {
  //   this.loginForm = this.fb.group({
  //     username: [
  //       this.defaultAuth.username,
  //       Validators.compose([
  //         Validators.required,
  //         Validators.minLength(3),
  //         Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
  //       ]),
  //     ],
  //     password: [
  //       this.defaultAuth.password,
  //       Validators.compose([
  //         Validators.required,
  //         Validators.minLength(3),
  //         Validators.maxLength(100),
  //       ]),
  //     ],
  //   });
  // }
  //
  // submit() {
  //   this.hasError = false;
  //   const loginSubscr = this.authService
  //     .login(this.f.username.value, this.f.password.value)
  //     .pipe(first())
  //     .subscribe((user: UserModel) => {
  //       if (user) {
  //         this.router.navigate([this.returnUrl]);
  //       } else {
  //         this.hasError = true;
  //       }
  //     });
  //   this.unsubscribe.push(loginSubscr);
  // }
  //
  // ngOnDestroy() {
  //   this.unsubscribe.forEach((sb) => sb.unsubscribe());
  // }

  credentials = {
    username: '',
    password: '',
  };
  showPassword = false;
  loginFormGroup: FormGroup;
  errLogin: any;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;

  captchaIsLoaded = false;
  captchaSuccess = false;
  captchaIsExpired = false;
  captchaResponse?: string;
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginFormGroup.controls;
  }

  initForm() {
    this.loginFormGroup = this.fb.group({
      username: [
        this.credentials.username,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: [
        this.credentials.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.loginFormGroup.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.loginFormGroup.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  submit() {
    if (!this.isValidForm()) {
       return;
    }

    this.hasError = false;
    // const loginSubscr = this.authService
    //   .login(this.f.username.value, this.f.password.value)
    //   .pipe(first())
    //   .subscribe((user: UserModel) => {
    //     if (user) {
    //       this.router.navigate([this.returnUrl]);
    //     } else {
    //       this.hasError = true;
    //     }
    //   });
    // this.unsubscribe.push(loginSubscr);
    const loginSubscr = this.authService
      .login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe((response) => {
        if (response) {
          location.reload();
        } else {
          this.hasError = true;
          this.errLogin = this.authService.responseLogin;
        }
      });
    this.unsubscribe.push(loginSubscr);
  }

  getError(el) {
    const placeholder = '{{name}}';
    const placeholderMin = '{{min}}';
    const placeholderMax = '{{max}}';
    const requireText = this.translate.instant('VALIDATION.REQUIRED');
    const minlengthText = this.translate.instant('VALIDATION.MIN_LENGTH');
    const maxlengthText = this.translate.instant('VALIDATION.MAX_LENGTH');
    const usernameFieldText = this.translate.instant('AUTH.LOGIN.USERNAME');
    const passwordFieldText = this.translate.instant('AUTH.LOGIN.PASSWORD');

    switch (el) {
      case 'username':
        if (this.loginFormGroup.get(el).errors.required) {
          return requireText.replace(placeholder, usernameFieldText);
        } else if (!!this.loginFormGroup.get(el).errors.minlength) {
          return minlengthText
            .replace(placeholder, usernameFieldText)
            .replace(
              placeholderMin,
              this.loginFormGroup.get(el).errors.minlength.requiredLength,
            );
        } else if (!!this.loginFormGroup.get(el).errors.maxlength) {
          return maxlengthText
            .replace(placeholder, usernameFieldText)
            .replace(
              placeholderMax,
              this.loginFormGroup.get(el).errors.maxlength.requiredLength,
            );
        }
        break;
      case 'password':
        if (this.loginFormGroup.get(el).errors.required) {
          return requireText.replace(placeholder, passwordFieldText);
        }
        break;
      default:
        return '';
    }
  }

  // handleReset(): void {
  //   this.captchaSuccess = false;
  //   this.captchaResponse = undefined;
  //   this.captchaIsExpired = false;
  //   this.cdr.detectChanges();
  // }
  //
  // handleExpire(): void {
  //   this.captchaSuccess = false;
  //   this.captchaIsExpired = true;
  //   this.cdr.detectChanges();
  // }
  //
  // handleSuccess(captchaResponse: string): void {
  //   this.captchaSuccess = true;
  //   this.captchaResponse = captchaResponse;
  //   this.captchaIsExpired = false;
  //   this.cdr.detectChanges();
  // }
  //
  // handleLoad(): void {
  //   this.captchaIsLoaded = true;
  //   this.captchaIsExpired = false;
  //   this.cdr.detectChanges();
  // }

  register() {
    this.router.navigate(['/auth/registration']);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
