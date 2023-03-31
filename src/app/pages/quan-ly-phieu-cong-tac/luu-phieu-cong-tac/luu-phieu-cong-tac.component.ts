import { OnDestroy } from '@angular/core';
import { QuanLyPhieuCongTacService } from './../../_services/quanLyPhieuCongTac.service';
import { Component, Inject, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonAlertDialogComponent } from '../../common/common-alert-dialog/common-alert-dialog.component';
import { CommonService } from '../../_services/common.service';
import { CONFIG } from 'src/app/utils/constants';
import { RequestApiModel } from '../../_models/request-api.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-luu-phieu-cong-tac',
  templateUrl: './luu-phieu-cong-tac.component.html',
  styleUrls: ['./luu-phieu-cong-tac.component.scss']
})
export class LuuPhieuCongTacComponent implements OnInit, OnDestroy {
  isUpdate: boolean = false;
  saveForm: FormGroup;
  startDateErrorMsg: string = '';
  endDateErrorMsg: string = '';
  createDateErrorMsg: string = '';

  private subscriptions: Subscription[] = [];

  jobRequestId: number;
  maPhieuCongTac;
  tenPhieuCongTac;
  mucDichCongTac = '';
  moTaChiTiet;
  nguonKinhPhi;
  ghiChu;

  userName: string;

  constructor(
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private fb: FormBuilder,
    private commonService: CommonService,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    @Inject(Injector) private readonly injector: Injector,
    public spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.loadForm();
  }

  loadForm() {
    this.saveForm = this.fb.group({
      tenPhieuCongTac: [this.tenPhieuCongTac, [Validators.required, Validators.maxLength(100)]],
      mucDichCongTac: [this.mucDichCongTac, [Validators.required]],
      moTaChiTiet: [this.moTaChiTiet, [Validators.required, Validators.maxLength(500)]],
      nguonKinhPhi: [this.nguonKinhPhi, []],
      ghiChu: [this.ghiChu, []]
    });
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.saveForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.saveForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  eClose() {
    this.activeModal.close();
  }

  eCloseWithoutEdit() {
    this.activeModal.dismiss();
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.saveForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.saveForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  control(controlName: string): AbstractControl {
    return this.saveForm.controls[controlName];
  }

  confirmSave() {
    if (!this.isValidForm()) {
      this.saveForm.markAllAsTouched();
      return;
    }
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.isUpdate ? (this.translate.instant('CONFIRM.UPDATE_JOB')) : (this.translate.instant('CONFIRM.ADD_JOB')),
      continue: true,
      cancel: true,
      btn: [
        {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
        {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
      ]
    };
    modalRef.result.then(
      result => {
        if (result == 'CANCEL') { return false; }
        if (result == 'CONTINUE') {
          this.savePhieuCongTac();
        }
      },
      reason => {
        return false;
      }
    );
  }

  savePhieuCongTac() {
    if(this.isUpdate) {
      const requestTarget = {
        functionName: 'editJobRequest',
        method: 'POST',
        params: {
          userName: this.userName,
          jobRequestDTO: {
            jobRequestId: this.jobRequestId,
            name: this.saveForm.controls['tenPhieuCongTac'].value,
            description: this.saveForm.controls['moTaChiTiet'].value,
            purpose: this.saveForm.controls['mucDichCongTac'].value,
            sourceExpense: this.saveForm.controls['nguonKinhPhi'].value,
            note: this.saveForm.controls['ghiChu'].value,
          }
        }
      };
      const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
        if (res && res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.UPDATE_JOB_SUCCESS'));
          this.eClose();
        } else {
          this.toastService.error(res.description);
        }
      });
      this.subscriptions.push(rq);
    } else {
      const requestTarget = {
        functionName: 'addJobRequest',
        method: 'POST',
        params: {
          userName: this.userName,
          jobRequestDTO: {
            name: this.saveForm.controls['tenPhieuCongTac'].value,
            description: this.saveForm.controls['moTaChiTiet'].value,
            purpose: this.saveForm.controls['mucDichCongTac'].value,
            sourceExpense: this.saveForm.controls['nguonKinhPhi'].value,
            note: this.saveForm.controls['ghiChu'].value,
          }
        }
      };
      const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
        if (res && res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.ADD_JOB_REQUEST_SUCCESS'));
          this.eClose();
        } else {
          this.toastService.error(res.description);
        }
      });
      this.subscriptions.push(rq);
    }
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
