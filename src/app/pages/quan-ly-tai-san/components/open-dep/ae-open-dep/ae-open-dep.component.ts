import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { CONFIG } from 'src/app/utils/constants';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe, formatNumber } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { RequestApiModel } from 'src/app/pages/_models/api.request.model';
import { removeNumberComma } from 'src/app/_validators/validateForm';
import { debounceTime } from 'rxjs/operators';

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
  selector: 'app-ae-open-dep',
  templateUrl: './ae-open-dep.component.html',
  styleUrls: ['./ae-open-dep.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AeOpenDepComponent implements OnInit {
  propData;
  propAction;
  parentAssetCode;
  assetCode;
  typeOfAssetCode = '';

  departmentCode = '';
  sourceOfAsset = '';

  beginOriginalAmountTotal; // hien tai
  beginOriginalAmount; // mong muon
  beginAmountTotal;
  beginAmount;

  constructionDateStr;
  depreciationStartDateStr;
  depreciationStartDateErrorMsg = '';
  constructionDateErrorMsg = '';
  userName: any;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  modelChanged = new Subject<string>();
  addForm: FormGroup;
  editForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    public fb: FormBuilder,
    private globalService: GlobalService,
    public modalService: NgbModal,
    public translate: TranslateService,
    public toastrService: ToastrService,
    private activeModal: NgbActiveModal,
    public spinner: NgxSpinnerService,
    public openingBalanceService: openingBalanceService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector,
  ) {}

  initCombobox() {
    let reqGetListStatus = { userName: this.userName };
    this.openingBalanceService.getListOrganisation(reqGetListStatus, 'get-list-organisation', true);
    this.openingBalanceService.getCbxTypeOfAsset(reqGetListStatus, 'getCbxTypeOfAsset', true);
    this.openingBalanceService.getSourceOfAsset(reqGetListStatus, 'get-source-of-asset', true);
    this.openingBalanceService.getCbxAssetParentAssetCode(reqGetListStatus, 'search-open-dep');
  }

  ngOnInit(): void {
    this.initCombobox();
    this.modelChanged.pipe(debounceTime(800)).subscribe((value) => {
      let reqGetListStatus = { userName: this.userName };
      this.openingBalanceService.getCbxAssetParentAssetCode(reqGetListStatus, 'search-open-dep', value);
    });
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    if (this.propAction == 'update') {
      // this.constructionDateStr = this.propData.constructionDateStr;
      this.assetCode = this.propData.assetCode;
      this.typeOfAssetCode = this.propData.typeOfAssetCode;
      this.departmentCode = this.propData.departmentCode;
      this.sourceOfAsset = this.propData.sourceOfAsset;
      this.beginOriginalAmountTotal = this.propData.beginOriginalAmount;
      // this.beginOriginalAmount = this.propData.beginOriginalAmount;
      this.beginAmountTotal = this.propData.beginAmount;
      // this.beginAmount = this.propData.beginAmount;
    }
    if (this.propAction == 'add') {
      this.loadAddForm();
    } else if (this.propAction == 'update') {
      this.loadEditForm();
    }
  }

  loadAddForm() {
    this.addForm = this.fb.group({
      parentAssetCode: [this.parentAssetCode],
      assetCode: [this.assetCode, [Validators.required]],
      typeOfAssetCode: [this.typeOfAssetCode, [Validators.required]],
      departmentCode: [this.departmentCode, [Validators.required]],
      sourceOfAsset: [this.sourceOfAsset, [Validators.required]],
      beginOriginalAmount: [this.beginOriginalAmount, [Validators.required]],
      beginAmount: [this.beginAmount, [Validators.required]],
      constructionDateStr: [new Date(), [Validators.required]],
      depreciationStartDateStr: [new Date(), [Validators.required]],
    });
  }

  loadEditForm() {
    this.editForm = this.fb.group({
      constructionDateStr: [this.constructionDateStr, [Validators.required]],
      assetCode: [this.assetCode],
      beginOriginalAmountTotal: [formatNumber(+this.beginOriginalAmountTotal, 'en-US', '1.0')],
      beginOriginalAmount: [this.beginOriginalAmount, [Validators.required]],
      beginAmountTotal: [formatNumber(this.beginAmountTotal, 'en-US', '1.0')],
      beginAmount: [this.beginAmount, [Validators.required]],
    });
  }

  filterByParentAssetCode() {
    this.modelChanged.next(this.addForm.get('parentAssetCode').value);
  }

  displayFnParentAssetCode(item: any): string {
    return item ? item.assetCode : undefined;
  }

  httpAdd() {
    const requestTarget = {
      userName: this.userName,
      depreciationDetailDTO: {
        parentAssetCode: !this.addForm.get('parentAssetCode').value.assetCode ? this.addForm.get('parentAssetCode').value : this.addForm.get('parentAssetCode').value.assetCode,
        assetCode: this.addForm.get('assetCode').value,
        typeOfAssetCode: this.addForm.get('typeOfAssetCode').value,
        organisation: this.addForm.get('departmentCode').value,
        sourceOfAsset: this.addForm.get('sourceOfAsset').value,
        beginOriginalAmount: Number(this.addForm.get('beginOriginalAmount').value.replaceAll(',', '')),
        beginAmount: Number(this.addForm.get('beginAmount').value.replaceAll(',', '')),
        constructionDateStr: this.transform(this.addForm.get('constructionDateStr').value),
        depreciationStartDateStr: this.transform(this.addForm.get('depreciationStartDateStr').value),
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModel, 'add-open-dep-single');
  }

  httpEdit() {
    const requestTarget = {
      userName: this.userName,
      depreciationDetailDTO: {
        assetCode: this.editForm.get('assetCode').value,
        constructionDateStr: this.transform(this.editForm.get('constructionDateStr').value),
        beginOriginalAmountTotal: removeNumberComma(this.editForm.value.beginOriginalAmountTotal),
        beginOriginalAmount: removeNumberComma(this.editForm.value.beginOriginalAmount),
        beginAmountTotal: removeNumberComma(this.editForm.value.beginAmountTotal),
        beginAmount: removeNumberComma(this.editForm.value.beginAmount),
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModel, 'update-open-dep-single');
  }

  isValidForm(): boolean {
    let isValid = true;
    if (this.propAction == 'add') {
      Object.keys(this.addForm.controls).forEach((key) => {
        const controlErrors: ValidationErrors = this.addForm.get(key).errors;
        if (controlErrors) {
          isValid = false;
        }
      });
      if (this.depreciationStartDateErrorMsg !== '' || this.constructionDateErrorMsg != '') {
        isValid = false;
      }
      return isValid;
    } else if (this.propAction == 'update') {
      Object.keys(this.editForm.controls).forEach((key) => {
        const controlErrors: ValidationErrors = this.editForm.get(key).errors;
        if (controlErrors) {
          isValid = false;
        }
      });
      if (this.constructionDateErrorMsg !== '') {
        isValid = false;
      }
      return isValid;
    }
  }

  // common modal confirm alert
  eSave(action) {
    if (!this.isValidForm()) {
      this.propAction == 'add' ? this.addForm.markAllAsTouched() : this.editForm.markAllAsTouched();
      return;
    }
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message:
        action == 'add'
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
        if (this.propAction == 'add') {
          let request = this.httpAdd().subscribe((res) => {
            if (res.errorCode === '0') {
              this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_ADD'));
              this.activeModal.close();
            } else {
              this.toastrService.error(res.description);
            }
          });
          this.subscriptions.push(request);
        } else if (this.propAction == 'update') {
          let request = this.httpEdit().subscribe((res) => {
            if (res.errorCode === '0') {
              this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_UPDATE'));

              this.activeModal.close();
            } else {
              this.toastrService.error(res.description);
            }
          });
          this.subscriptions.push(request);
        }
      },
      () => {},
    );
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

  eChangeDate() {
    if (this.propAction == 'add') {
      let tempdepreciationStartDate = this.transform(this.addForm.get('depreciationStartDateStr').value);
      let tempconstructionDate = this.transform(this.addForm.get('constructionDateStr').value);
      if (
        tempdepreciationStartDate == '' ||
        tempdepreciationStartDate == null ||
        tempdepreciationStartDate == undefined
      ) {
        this.depreciationStartDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {
          name: this.translate.instant('LABEL.DEPRECIATION_STARTDATE'),
        });
      } else {
        this.depreciationStartDateErrorMsg = '';
      }

      if (tempconstructionDate == '' || tempconstructionDate == null || tempconstructionDate == undefined) {
        this.constructionDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {
          name: this.translate.instant('LABEL.CONSTRUCTION_DATE'),
        });
      } else {
        this.constructionDateErrorMsg = '';
      }
    }
    if (this.propAction == 'update') {
      let tempconstructionDate = this.transform(this.editForm.get('constructionDateStr').value);
      if (tempconstructionDate == '' || tempconstructionDate == null || tempconstructionDate == undefined) {
        this.constructionDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {
          name: this.translate.instant('LABEL.CONSTRUCTION_DATE'),
        });
      } else {
        this.constructionDateErrorMsg = '';
      }
    }
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
    if (this.propAction == 'add') {
      const control = this.addForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    } else if (this.propAction == 'update') {
      const control = this.editForm.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    }
  }

  isControlInvalid(controlName: string): boolean {
    if (this.propAction == 'add') {
      const control = this.addForm.controls[controlName];
      return control.invalid && (control.dirty || control.touched);
    } else if (this.propAction == 'update') {
      const control = this.editForm.controls[controlName];
      return control.invalid && (control.dirty || control.touched);
    }
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
