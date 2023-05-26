import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
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
  code;
  name;
  account;
  depreciationFrame;
  description;
  userName: any;
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
    public openingBalanceService: openingBalanceService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector,
  ) {
    this._createForm();// new
  }

  ngOnInit(): void {
    this.loadAddEditForm();
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
  }

  loadAddEditForm() {
    this.addEditForm = this.fb.group({
      name: [this.name, [Validators.required]],
      account: [this.account, [Validators.required]],
      depreciationFrame: [this.depreciationFrame, [Validators.required, minValue(1)]],
      description: [this.description, [Validators.required]],
    });
  }

  httpAddOrEdit() {
    const requestTarget = {
      userName: this.userName,
      typeOfAssetDTO: {
        name: this.addEditForm.get('name').value,
        account: this.addEditForm.get('account').value,
        depreciationFrame: this.addEditForm.get('depreciationFrame').value,
        description: this.addEditForm.get('description').value,
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModel, 'addTypeOfAsset');
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
      message: this.translate.instant('FUNCTION.CONFIRM_ADD'),
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
            this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_ADD'));
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

  // new modal
  _form: FormGroup;
  _addGroup() {
    this._groupsFormArray.push(
      this.fb.control({
        conjunctor: null,
        conditions: [],
        groups: []
      })
    );
  }

  _delete(index: number) {
    this._groupsFormArray.removeAt(index);
  }

  get _groupsFormArray(): FormArray {
    return this._form.get("statement").get("groups") as FormArray;
  }

  private _createForm() {
    this._form = this.fb.group({
      statement: this.fb.group({
        groups: this.fb.array([])
      })
    });
  }
}
