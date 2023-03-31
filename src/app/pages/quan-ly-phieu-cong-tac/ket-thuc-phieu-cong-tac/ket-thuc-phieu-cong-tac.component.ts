import { JobAttachDTO, JobRoutingDTO } from './../../_models/quan-ly-phieu-cong-tac.model';
import { Component, Inject, Injector, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CONFIG } from 'src/app/utils/constants';
import { CommonAlertDialogComponent } from '../../common/common-alert-dialog/common-alert-dialog.component';
import { RequestApiModel } from '../../_models/request-api.model';
import { CommonService } from '../../_services/common.service';
import { QuanLyPhieuCongTacService } from '../../_services/quanLyPhieuCongTac.service';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-ket-thuc-phieu-cong-tac',
  templateUrl: './ket-thuc-phieu-cong-tac.component.html',
  styleUrls: ['./ket-thuc-phieu-cong-tac.component.scss']
})
export class KetThucPhieuCongTacComponent implements OnInit, OnDestroy {
  saveForm: FormGroup;
  fileForm: FormGroup;

  jobRequestId: number;
  jobRequestCode: string;
  jobRequestName: string;
  chiPhiKhachSan: any = 0;
  congTacPhi: any = 0;
  chiPhiLoTrinh: any = 0;
  chiPhiKhac: any = null;
  status;

  userName: string;
  selectedFile: any = null;
  isLoading$: boolean = false;
  listJobRoutingDTO = new BehaviorSubject<JobRoutingDTO[]>([]);

  subscriptions: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private fb: FormBuilder,
    private commonService: CommonService,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    @Inject(Injector) private readonly injector: Injector,
    public spinner: NgxSpinnerService
  ) {
  }
  
  ngOnInit() {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.loadForm();
    this.loadFileForm();
    this.initDataBox();
  }
  
  initDataBox() {
    //FILE TYPE
    let requestFileType = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'FILE_TYPE'
        }
      }
    }
    this.quanLyPhieuCongTacService.getListFileTypeBox(requestFileType, true);

    //DATA
    let requestShowFinishJob = {
      functionName: 'showFinishJobRequest',
      method: 'POST',
      params: {
        userName: this.userName,
        jobRequestDTO: {
          jobRequestId: this.jobRequestId
        }
      }
    }
    const request = this.quanLyPhieuCongTacService.getShowFinishJobData(requestShowFinishJob).subscribe(res => {
      let finishJobRequest = this.quanLyPhieuCongTacService.finishJobRequest;
      this.chiPhiKhachSan = finishJobRequest.realHotelAmount != null ? this.number(finishJobRequest.realHotelAmount) : this.number(finishJobRequest.hotelEstimateAmount);
      this.congTacPhi = finishJobRequest.realBusinessAmount != null ? this.number(finishJobRequest.realBusinessAmount) : this.number(finishJobRequest.businessEstimateAmount);
      this.chiPhiLoTrinh = finishJobRequest.realRoutingAmount != null ? this.number(finishJobRequest.realRoutingAmount) : this.number(finishJobRequest.routingEstimateAmount);
      this.chiPhiKhac = finishJobRequest.realOtherAmount != null ? this.number(finishJobRequest.realOtherAmount) : this.number(finishJobRequest.otherEstimateAmount);
      this.listJobRoutingDTO.next(this.quanLyPhieuCongTacService.listFinishJobRouting.value);
      this.loadForm();
      this.loadFileForm();
    });
    this.subscriptions.push(request);
  }

  number(value) {
    return formatNumber(+value, 'en-US', '1.0');
  }
  
  loadForm() {
    this.saveForm = this.fb.group({
      chiPhiKhachSan: [this.chiPhiKhachSan, [ Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/)]],
      congTacPhi: [this.congTacPhi, [ Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/)]],
      chiPhiLoTrinh: [this.chiPhiLoTrinh, [ Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/)]],
      chiPhiKhac: [this.chiPhiKhac, [ Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/)]],
      ghiChuChiPhi: [''],
    });
  }

  loadFileForm() {
    this.fileForm = this.fb.group({
      loTrinh: [this.listJobRoutingDTO.value.length > 0 ? this.listJobRoutingDTO.value[0].id : '', [Validators.required]],
      loaiFile: ['', [Validators.required]],
      chonFile: ['', [Validators.required]],
      ghiChu: ['']
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  eAddFile() {
    if (!this.isValidFileForm()) {
      this.fileForm.markAllAsTouched();
      return;
    }

    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.ADD_FILE'),
      continue: true,
      cancel: true,
      btn: [
        {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
        {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
      ]
    };
    modalRef.result.then(
      result => {
        // add
        const formData: FormData = new FormData();
        formData.append('fileCreateRequest', this.selectedFile);
        const requestTarget = {
          functionName: 'addJobAttach',
          method: 'POST',
          params: {
            userName: this.userName,
            jobRoutingId: this.controlFile('loTrinh').value,
            type: this.controlFile('loaiFile').value,
            note: this.controlFile('ghiChu').value,
            isFinish: 1
          },
          formData: formData
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.ADD_FILE_SUCCESS'));
            this.eReloadFileData();
            // clear form
            this.eResetFileForm();
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

  eReloadFileData() {
    this.initDataBox();
  }

  eDownloadFile(item) {
    const requestTarget = {
      functionName: 'getFile',
      method: 'POST',
      params: {
        userName: this.userName,
        jobAttachDTO: {
          id: item.id
        }
      },
      responseType: "blob",
      observe: "response"
    };
    this.isLoading$ = true;
    const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      this.quanLyPhieuCongTacService.saveFile(item.fileName, item.mimeType, res);
    });
    this.subscriptions.push(rq);
  }

  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.DELETE_FILE_ATTACH'),
      continue: true,
      cancel: true,
      btn: [
        {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
        {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
      ]
    };
    modalRef.result.then(
      result => {
        const requestTarget = {
          functionName: 'removeJobAttach',
          method: 'POST',
          params: {
            userName: this.userName,
            jobAttachDTO: {
              id: item.id
            }
          }
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_FILE_SUCCESS'));
            this.eReloadFileData();
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

  eResetFileForm() {
    this.loadFileForm();
    this.selectedFile = null;
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.saveForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.saveForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlInvalidFile(controlName: string): boolean {
    const control = this.fileForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasErrorFile(validation, controlName): boolean {
    const control = this.fileForm.controls[controlName];
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

  isValidFileForm(): boolean {
    let isValid = true;
    Object.keys(this.fileForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.fileForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  control(controlName: string): AbstractControl {
    return this.saveForm.controls[controlName];
  }

  controlFile(controlName: string): AbstractControl {
    return this.fileForm.controls[controlName];
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
      message: this.translate.instant('CONFIRM.FINISH_JOB'),
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
    const requestTarget = {
      functionName: 'finishJobRequest',
      method: 'POST',
      params: {
        userName: this.userName,
        jobRequestDTO: {
          jobRequestId: this.jobRequestId,
          realBusinessAmount: this.control('congTacPhi').value.replace(/,/g, ''),
          realRoutingAmount: this.control('chiPhiLoTrinh').value.replace(/,/g, ''),
          realHotelAmount: this.control('chiPhiKhachSan').value.replace(/,/g, ''),
          realOtherAmount: this.control('chiPhiKhac').value ? this.control('chiPhiKhac').value.replace(/,/g, '') : 0,
          noteFinish: this.control('ghiChuChiPhi').value
        }
      }
    };
    const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      if (res && res.errorCode == '0') {
        this.toastService.success(this.translate.instant('MESSAGE.FINISH_JOB_SUCCESS'));
        this.eClose();
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(rq);
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
