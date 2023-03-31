import { OnDestroy } from '@angular/core';
import { Component, Inject, Injector, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CONFIG } from 'src/app/utils/constants';
import { CommonAlertDialogComponent } from '../../common/common-alert-dialog/common-alert-dialog.component';
import { PreviewPdfComponent } from '../../common/preview-pdf/preview-pdf.component';
import { StaffDTO } from '../../_models/quan-ly-phieu-cong-tac.model';
import { RequestApiModel } from '../../_models/request-api.model';
import { CommonService } from '../../_services/common.service';
import { QuanLyPhieuCongTacService } from '../../_services/quanLyPhieuCongTac.service';

@Component({
  selector: 'app-trinh-ky-voffice',
  templateUrl: './trinh-ky-voffice.component.html',
  styleUrls: ['./trinh-ky-voffice.component.scss']
})
export class TrinhKyVofficeComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  
  queryInit = {
    lstEmail: [],
    // toWhoVi: '',
    branchVi: this.quanLyPhieuCongTacService.selectedPhieuCongTac.nameShop,
    workingContentVi: this.quanLyPhieuCongTacService.selectedPhieuCongTac.description,
    jobNameVi: this.quanLyPhieuCongTacService.selectedPhieuCongTac.name,
    baseVi: '',
    // toWhoEn: '',
    branchEn: this.quanLyPhieuCongTacService.selectedPhieuCongTac.nameShop,
    workingContentEn:  this.quanLyPhieuCongTacService.selectedPhieuCongTac.description,
    jobNameEn: this.quanLyPhieuCongTacService.selectedPhieuCongTac.name,
    baseEn: '',
    // toWhoLa: '',
    branchLa: this.quanLyPhieuCongTacService.selectedPhieuCongTac.nameShop,
    workingContentLa:  this.quanLyPhieuCongTacService.selectedPhieuCongTac.description,
    jobNameLa: this.quanLyPhieuCongTacService.selectedPhieuCongTac.name,
    baseLa: '',
    userNameSignVo: '',
    passwordSignVo: '',
    listLocale: []
  }

  query = {
    ...this.queryInit
  };

  initLocaleList = [
    {
      name: this.translate.instant('LABEL.VI'),
      value: 'vi'
    },
    {
      name: this.translate.instant('LABEL.EN'),
      value: 'en'
    },
    {
      name: this.translate.instant('LABEL.LA'),
      value: 'la'
    },
  ];

  signForm: FormGroup;
  userName: string;
  @Output() eventSearchJobRequest = new EventEmitter();

  constructor(
    public translate: TranslateService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    @Inject(Injector) private readonly injector: Injector
  ) { }

  ngOnInit() {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.initDataBox();
    this.loadForm();
  }

  initDataBox() {
    //STAFF NOI BO TRINH KY
    let requestStaff = {
      functionName: 'getCbStaff',
      method: 'POST',
      params: {
        userName: this.userName,
        staffType: '1',
        autoCompleteValue: '', // cần lấy giá trị nhập text (chưa hoàn thiện),
        isSignVOStaff: true
      }
    }
    const rq = this.quanLyPhieuCongTacService.getListStaffBox(requestStaff, false).subscribe();
    this.subscriptions.push(rq);
  }

  loadForm() {
    this.signForm = this.fb.group({
      lstEmail: this.fb.array([
        this.addEmailFormControl()
      ]),
      userNameSignVo: ['', Validators.required],
      passwordSignVo: ['', Validators.required],
      listLocale: [[], Validators.required]
    });
  }

  filter(name: string) {
    const requestStaff = {
      functionName: 'getCbStaff',
      method: 'POST',
      params: {
        userName: this.userName,
        staffType: '1',
        autoCompleteValue: name, // cần lấy giá trị nhập text (chưa hoàn thiện),
        isSignVOStaff: true
      }
    };
    const rq = this.quanLyPhieuCongTacService.getListStaffBox(requestStaff, false).subscribe();
    this.subscriptions.push(rq);
  }

  displayFn(user?: StaffDTO): string | undefined {
      return user ? user.shopStaffEmail : undefined;
  }

  changeEmail(index, $event) {
    (<FormArray>this.signForm.controls['lstEmail']).controls[index].setValue($event.target.value);
  }

  eChangeLocales(locales: string[]) {
    let viIndex = locales.findIndex(locale => locale == 'vi');
    if (viIndex != -1) {
      // this.signForm.addControl('toWhoVi', new FormControl('', Validators.required));
      this.signForm.addControl('branchVi', new FormControl('', Validators.required));
      this.signForm.addControl('workingContentVi', new FormControl('', Validators.required));
      this.signForm.addControl('baseVi', new FormControl('', Validators.required));
      this.signForm.addControl('jobNameVi', new FormControl('', Validators.required));
    } else {
      // this.signForm.removeControl('toWhoVi');
      this.signForm.removeControl('branchVi');
      this.signForm.removeControl('workingContentVi');
      this.signForm.removeControl('baseVi');
      this.signForm.removeControl('jobNameVi');
    }

    let enIndex = locales.findIndex(locale => locale == 'en');
    if (enIndex != -1) {
      // this.signForm.addControl('toWhoEn', new FormControl('', Validators.required));
      this.signForm.addControl('branchEn', new FormControl('', Validators.required));
      this.signForm.addControl('workingContentEn', new FormControl('', Validators.required));
      this.signForm.addControl('baseEn', new FormControl('', Validators.required));
      this.signForm.addControl('jobNameEn', new FormControl('', Validators.required));
    } else {
      // this.signForm.removeControl('toWhoEn');
      this.signForm.removeControl('branchEn');
      this.signForm.removeControl('workingContentEn');
      this.signForm.removeControl('baseEn');
      this.signForm.removeControl('jobNameEn');
    }

    let laIndex = locales.findIndex(locale => locale == 'la');
    if (laIndex != -1) {
      // this.signForm.addControl('toWhoLa', new FormControl('', Validators.required));
      this.signForm.addControl('branchLa', new FormControl('', Validators.required));
      this.signForm.addControl('workingContentLa', new FormControl('', Validators.required));
      this.signForm.addControl('baseLa', new FormControl('', Validators.required));
      this.signForm.addControl('jobNameLa', new FormControl('', Validators.required));
    } else {
      // this.signForm.removeControl('toWhoLa');
      this.signForm.removeControl('branchLa');
      this.signForm.removeControl('workingContentLa');
      this.signForm.removeControl('baseLa');
      this.signForm.removeControl('jobNameLa');
    }
  }

  addEmailFormControl() {
    const newEmail = new FormControl(
      {
        email: '',
        shopStaffEmail: '',
      }, Validators.required);
    
    const sb = newEmail.valueChanges.pipe(debounceTime(800)).subscribe(event => {
      if (typeof event == 'string') {
          this.filter(event);
      } else {
          this.filter('');
      }
    });
    this.subscriptions.push(sb);
    return newEmail;
  }

  eNewEmail() {
    (<FormArray>this.control('lstEmail')).push(this.addEmailFormControl());
  }

  eRemoveEmail(index) {
    (<FormArray>this.control('lstEmail')).removeAt(index);
  }

  get emailControlList(): AbstractControl[] {
    return (<FormArray>this.control('lstEmail')).controls;
  }
  
  get emailListSize(): number {
    return (<FormArray>this.control('lstEmail')).length;
  }

  ePreview() {
    if (!this.isEnabledSignVOffice()) return;

    if (!this.isValidForm()) {
      this.signForm.markAllAsTouched();
      return;
    }

    //parse lstEmail to param
    let lstEmail = (<FormArray>this.signForm.controls['lstEmail']).controls.map((item, index) => {
      return {
        email: item.value.email,
        orderSign: index + 1
      }
    });

    const requestTarget = {
      functionName: 'preview-pdf-sign-voffice',
      method: 'POST',
      params: {}
    };

    const formValues = this.signForm.value;
    Object.assign(requestTarget.params, formValues);
    Object.assign(requestTarget.params, {lstEmail: lstEmail});
    Object.assign(requestTarget.params, {jobRequestId: this.quanLyPhieuCongTacService.selectedPhieuCongTac.jobRequestId});

    const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      if (res.errorCode == '0') {
        const byteArray = new Uint8Array(atob(res.data).split('').map(char => char.charCodeAt(0)));
        const data = window.URL.createObjectURL(new Blob([byteArray], {type: 'application/pdf'}));

        const modalRef = this.modalService.open(PreviewPdfComponent, {
          centered: true,
          backdrop: 'static',
          windowClass: 'big-size-model-class modal-preview-pdf'
        });
        modalRef.componentInstance.srcPreviewPdf = data;
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(rq);
  }

  eSignVOffice() {
    if (!this.isEnabledSignVOffice()) return;
    
    if (!this.isValidForm()) {
      this.signForm.markAllAsTouched();
      return;
    }

    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.SIGN_JOB'),
      continue: true,
      cancel: true,
      btn: [
        {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
        {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
      ]
    };
    modalRef.result.then(
      result => {
        //parse lstEmail to param
        let lstEmail = (<FormArray>this.signForm.controls['lstEmail']).controls.map((item, index) => {
          return {
            email: item.value.email,
            orderSign: index + 1
          }
        });

        const requestTarget = {
          functionName: 'sign-voffice',
          method: 'POST',
          params: {
            userName: this.userName,
          }
        };

        const formValues = this.signForm.value;
        Object.assign(requestTarget.params, formValues);
        Object.assign(requestTarget.params, {lstEmail: lstEmail});
        Object.assign(requestTarget.params, {jobRequestId: this.quanLyPhieuCongTacService.selectedPhieuCongTac.jobRequestId});

        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.SIGN_SUCCESS'));
            this.eventSearchJobRequest.emit();
          } else {
            this.toastService.error(res.description);
          }
        });
        this.subscriptions.push(rq);
      },
      reason => {
      }
    );
  }

  eViewVOfficeFile() {

  }

  eResetForm() {
    this.query = {
      ...this.queryInit
    };
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.signForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.signForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isEmailControlInvalid(index): boolean {
    const control = (<FormArray>this.signForm.controls['lstEmail']).controls[index];
    return control.invalid && (control.dirty || control.touched);
  }

  isEmailControlAutoCompleteInvalid(index, controlName: string, valueColumnName: string): boolean {
    const control = (<FormArray>this.signForm.controls['lstEmail']).controls[index];
    const valueColumn = control.value[valueColumnName];
    if (typeof control.value == 'string') {
      control.setErrors({'noSelect': true});
    } else {
      if (valueColumn == '') {
          control.setErrors({'required': true});
      }
    }
    return control.invalid && (control.dirty || control.touched);
  }

  castFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  controlHasError(validation, controlName): boolean {
    const control = this.signForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  controlEmailHasError(validation, index): boolean {
    const control = (<FormArray>this.signForm.controls['lstEmail']).controls[index];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.signForm.controls[controlName];
    return control.dirty || control.touched;
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.signForm.controls).forEach((key) => {
      if(key != 'lstEmail') {
        const controlErrors: ValidationErrors =
          this.signForm.get(key).errors;
  
        if (controlErrors) {
          isValid = false;
        }
      } else {
        (<FormArray>this.signForm.get(key)).controls.forEach((control: AbstractControl) => {
          if (control.errors) {
            isValid = false;
          }
        });
      }
    });

    return isValid;
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  control(controlName: string) {
    return this.signForm.controls[controlName];
  }

  emailControl(index) {
    return (<FormArray>this.signForm.controls['lstEmail']).controls[index];
  }

  getLocaleName(locale) {
    return this.initLocaleList.find(item => item.value == locale).name;
  }

  isEnabledSignVOffice() {
    let signVofficeStatus = this.quanLyPhieuCongTacService.selectedPhieuCongTac.signVofficeStatus;
    return this.control('listLocale').value.length > 0 && (signVofficeStatus == null || signVofficeStatus == 2);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
