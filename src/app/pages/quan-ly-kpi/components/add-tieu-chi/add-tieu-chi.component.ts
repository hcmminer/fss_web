import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { CONFIG } from 'src/app/utils/constants';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { RequestApiModel } from 'src/app/pages/_models/api.request.model';
import { minValue } from 'src/app/_validators/validateForm';
import { QuanLyKpiService } from 'src/app/pages/_services/quan-ly-kpi.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-tieu-chi',
  templateUrl: './add-tieu-chi.component.html',
  styleUrls: ['./add-tieu-chi.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddTieuChiComponent implements OnInit {
  isUpdate;
  beginContractDate;
  t1msg = '';

  expiredContractDate;
  t2msg = '';

  propData;
  kpiManagerId;
  parentId;
  kpiNameVi;
  kpiNameLa;
  contentVi;
  contentLa;
  kpiPolicyVi;
  kpiPolicyLa;
  staffCode = '';
  kpiPoint;

  userName: any;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  modelChanged = new Subject<string>();
  addEditForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    public fb: FormBuilder,
    private globalService: GlobalService,
    public modalService: NgbModal,
    public translate: TranslateService,
    public toastrService: ToastrService,
    private activeModal: NgbActiveModal,
    public spinner: NgxSpinnerService,
    public quanLyKpiService: QuanLyKpiService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);

    if (this.isUpdate) {
      this.kpiManagerId = this.propData?.kpiManagerId;
      this.kpiNameVi = this.propData.kpiNameVi;
      this.kpiNameLa = this.propData.kpiNameLa;
      this.contentVi = this.propData.contentVi;
      this.contentLa = this.propData.contentLa;
      this.kpiPolicyVi = this.propData.kpiPolicyVi;
      this.kpiPolicyLa = this.propData.kpiPolicyLa;
      this.staffCode = this.propData.staffCode;
      this.kpiPoint = this.propData.kpiPoint;
      this.beginContractDate = this.propData.beginContractDate;
      this.expiredContractDate = this.propData.expiredContractDate;
    } else {
      this.parentId = this.propData?.kpiManagerId ?? null;
    }
    this.loadAddEditForm();
    this.getCbxStaffKpi();
  }

  getCbxStaffKpi() {
    const reqTar = {
      userName: 'fss_admin',
      staffDTO: {
        staffCode: '',
      },
    };
    return this.quanLyKpiService.getCbxStaffKpi(reqTar, 'getLstStaffKpi', true);
  }

  loadAddEditForm() {
    this.addEditForm = this.fb.group({
      kpiNameVi: [this.kpiNameVi, [Validators.required]],
      kpiNameLa: [this.kpiNameLa, [Validators.required]],
      contentVi: [this.contentVi, [Validators.required]],
      contentLa: [this.contentLa, [Validators.required]],
      kpiPolicyVi: [this.kpiPolicyVi, [Validators.required]],
      kpiPolicyLa: [this.kpiPolicyLa, [Validators.required]],
      staffCode: [this.staffCode, [Validators.required]],
      kpiPoint: [this.kpiPoint, [Validators.required]],
      beginContractDate: [this.isUpdate ? this.beginContractDate : new Date(), [Validators.required]],
      expiredContractDate: [this.isUpdate ? this.expiredContractDate : new Date(), [Validators.required]],
    });
  }

  httpAddOrEdit() {
    const dto1 = [
      {
        parentId: this.parentId,
        kpiNameVi: this.addEditForm.get('kpiNameVi').value,
        kpiNameLa: this.addEditForm.get('kpiNameLa').value,
        contentVi: this.addEditForm.get('contentVi').value,
        contentLa: this.addEditForm.get('contentLa').value,
        kpiPolicyVi: this.addEditForm.get('kpiPolicyVi').value,
        kpiPolicyLa: this.addEditForm.get('kpiPolicyLa').value,
        staffCode: this.addEditForm.get('staffCode').value,
        kpiPoint: this.addEditForm.get('kpiPoint').value,
        beginContractDate: this.addEditForm.get('beginContractDate').value,
        expiredContractDate: this.addEditForm.get('expiredContractDate').value,
      },
    ];
    const dto2 = [
      {
        kpiManagerId: this.kpiManagerId,
        kpiNameVi: this.addEditForm.get('kpiNameVi').value,
        kpiNameLa: this.addEditForm.get('kpiNameLa').value,
        contentVi: this.addEditForm.get('contentVi').value,
        contentLa: this.addEditForm.get('contentLa').value,
        kpiPolicyVi: this.addEditForm.get('kpiPolicyVi').value,
        kpiPolicyLa: this.addEditForm.get('kpiPolicyLa').value,
        staffCode: this.addEditForm.get('staffCode').value,
        kpiPoint: this.addEditForm.get('kpiPoint').value,
        beginContractDate: this.addEditForm.get('beginContractDate').value,
        expiredContractDate: this.addEditForm.get('expiredContractDate').value,
      },
    ];
    const requestTarget1 = {
      userName: this.userName,
      lstKpiManagerDTO: dto1,
    };
    const requestTarget2 = {
      userName: this.userName,
      lstKpiManagerDTO: dto2,
    };
    return !this.isUpdate
      ? this.globalService.globalApi(requestTarget1, 'addOrUpdateKpiManager')
      : this.globalService.globalApi(requestTarget2, 'addOrUpdateKpiManager');
  }

  // common modal confirm alert
  eSave() {
    if (!this.isValidForm()) {
      this.addEditForm.markAllAsTouched();
      return;
    }
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: !this.isUpdate
        ? this.translate.instant('FUNCTION.CONFIRM_ADD')
        : this.translate.instant('FUNCTION.CONFIRM_UPDATE'),
      continue: true,
      cancel: true,
      btn: [
        { text: this.translate.instant('CANCEL'), className: 'btn-outline-warning btn uppercase mx-2' },
        { text: this.translate.instant('CONTINUE'), className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      () => {
        let request = this.httpAddOrEdit().subscribe((res) => {
          if (res.errorCode === '0') {
            !this.isUpdate
              ? this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_ADD'))
              : this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_UPDATE'));
            this.activeModal.close();
          } else {
            this.toastrService.error(res.description);
          }
        });
        this.subscriptions.push(request);
      },
      () => {},
    );
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addEditForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addEditForm.get(key).errors;
      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  //check number
  isNumber(amountApproved: any) {
    return Number(amountApproved);
  }

  //thay đổi format date
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  eCloseAndReRender() {
    this.activeModal.close();
  }

  eClose() {
    this.activeModal.dismiss();
  }

  controlHasError(validation, controlName): boolean {
    const control = this.addEditForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.addEditForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  eChangeDate() {
    let t1 = this.transform(this.addEditForm.get('beginContractDate').value);
    let t2 = this.transform(this.addEditForm.get('expiredContractDate').value);

    if (t1 == '' || t1 == null || t1 == undefined) {
      this.t1msg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('TITLE.BEGIN_CONTRACT_DATE'),
      });
    } else {
      this.t1msg = '';
    }

    if (t2 == '' || t2 == null || t2 == undefined) {
      this.t2msg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('TITLE.EXPIRED_CONTRACT_DATE'),
      });
    } else {
      this.t2msg = '';
    }
  }
}
