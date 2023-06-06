import { BehaviorSubject, Subscription } from 'rxjs';
import { Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuanLyPhieuCongTacService } from '../../../_services/quanLyPhieuCongTac.service';
import { CommonService } from '../../../_services/common.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonAlertDialogComponent } from '../../../common/common-alert-dialog/common-alert-dialog.component';
import { RequestApiModel } from '../../../_models/request-api.model';
import { CONFIG } from '../../../../utils/constants';
import { FileSaver } from 'src/app/utils/file-saver';

const MAX_FILE_SIZE_TEMPLATE = 1024 * 1024 * 10;

@Component({
  selector: 'app-add-edit-tab-dinh-muc-di-chuyen',
  templateUrl: './add-edit-tab-dinh-muc-di-chuyen.component.html',
  styleUrls: ['./add-edit-tab-dinh-muc-di-chuyen.component.scss'],
})
export class AddEditTabDinhMucDiChuyenComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @Output() reloadDataEvent = new EventEmitter<any>();
  addForm: FormGroup;
  addFileForm: FormGroup;
  isLoading$ = false;
  userRes: any;
  userName: any;
  isUpdate: boolean = false;

  id;
  tinhDi = '';
  tinhDen = '';
  phuongTien = '';
  chiPhi = null;
  ghiChu = '';

  addTypeList = [
    {
      value: 'single',
      name: this.translate.instant('LABEL.INPUT_SINGLE'),
      checked: true,
    },
    {
      value: 'file',
      name: this.translate.instant('LABEL.UPLOAD_FILE'),
      checked: false,
    },
  ];
  addType: string = 'single';
  selectedFile: any = null;
  resultFileData: any = null;
  totalSuccess: number = null;
  totalRecord: number = null;
  isHasResult: boolean = false;

  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    public spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal,
    @Inject(Injector) private readonly injector: Injector,
  ) {}

  ngOnInit() {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.loadAddForm();
  }

  loadAddForm() {
    this.addForm = this.fb.group({
      tinhDi: [this.tinhDi, [Validators.required]],
      tinhDen: [this.tinhDen, [Validators.required]],
      phuongTien: [this.phuongTien, [Validators.required]],
      chiPhi: [
        this.chiPhi,
        [
          Validators.required,
          Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/),
        ],
      ],
      ghiChu: [this.ghiChu],
    });
  }

  loadAddFileForm() {
    this.addFileForm = this.fb.group({
      chonFile: [null, [Validators.required]],
    });
  }

  changeState() {
    if (this.addType == 'single') {
      this.loadAddForm();
    } else {
      this.loadAddFileForm();
    }
  }

  onFileSelected(event: any): void {
    this.validateFile(event);
    this.selectedFile = event.target.files[0] ?? null;
    this.resultFileData = null;
  }

  validateFile(event: any) {
    let file = event.target.files[0];

    //check định dạng
    let allowedType: string[] = ['xls', 'xlsx'];
    let fileExtension: string = file.name.substring(file.name.lastIndexOf('.') + 1);
    if (!allowedType.includes(fileExtension)) {
      this.toastService.error(this.translate.instant('VALIDATION.FILE_INVALID_EXTENSION', { 0: '.xls, .xlsx' }));
      return;
    }
    //check dung luong
    if (file.size > MAX_FILE_SIZE_TEMPLATE) {
      this.toastService.error(this.translate.instant('VALIDATION.FILE_MAX_SIZE', { 0: 10 }));
      return;
    }
    // // check up trung file
    // if(file){
    //   file.name === null ? this.flag = true : this.flag = false;
    // }

    // this.fileNameTemplate = file.name;
    // this.file = file;
  }

  eCloseWithoutEdit() {
    this.activeModal.dismiss();
  }

  getTemplate() {
    this.quanLyPhieuCongTacService.downloadTemplate().subscribe((x) => {
      var blob = new Blob([x], { type: '' });
      var elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = 'IMPORT_ROUTING_PRICE_TMP.xlsx';
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    });
  }

  eSave(type) {
    if (type == 'single') {
      if (!this.isValidForm()) {
        this.addForm.markAllAsTouched();
        return;
      }
      const modalRef = this.modalService.open(CommonAlertDialogComponent, {
        centered: true,
        backdrop: 'static',
      });
      modalRef.componentInstance.data = {
        type: 'WARNING',
        title: 'COMMON_MODAL.WARNING',
        message: this.isUpdate
          ? this.translate.instant('CONFIRM.UPDATE_NORM_MOVE')
          : this.translate.instant('CONFIRM.ADD_NORM_MOVE'),
        continue: true,
        cancel: true,
        btn: [
          {
            text: 'CANCEL',
            className: 'btn-outline-warning btn uppercase mx-2',
          },
          { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
        ],
      };
      modalRef.result.then(
        (result) => {
          this.checkValidBeforeAddOrUpdate();
        },
        (reason) => {},
      );
    } else {
      if (!this.isValidFileForm()) {
        this.addFileForm.markAllAsTouched();
        return;
      }
      const modalRef = this.modalService.open(CommonAlertDialogComponent, {
        centered: true,
        backdrop: 'static',
      });
      modalRef.componentInstance.data = {
        type: 'WARNING',
        title: 'COMMON_MODAL.WARNING',
        message: this.translate.instant('CONFIRM.UPLOAD_FILE_NORM_MOVE'),
        continue: true,
        cancel: true,
        btn: [
          {
            text: 'CANCEL',
            className: 'btn-outline-warning btn uppercase mx-2',
          },
          { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
        ],
      };
      modalRef.result.then(
        (result) => {
          this.isHasResult = false;
          if (!this.isUpdate) {
            this.resultFileData = null;
            const formData: FormData = new FormData();
            formData.append('fileCreateRequest', this.selectedFile);
            const requestTarget = {
              functionName: 'importRoutingPrice',
              method: 'POST',
              params: {
                userName: this.userName,
              },
              formData: formData,
              responseType: 'blob',
              observe: 'response',
            };
            this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(
              (res) => {
                if (res) {
                  this.toastService.success(this.translate.instant('MESSAGE.UPDATE_FILE_NORM_MOVING_SUCCESS'));
                  this.totalSuccess = res.headers.get('total-success');
                  this.totalRecord = res.headers.get('total-record');
                  this.isHasResult = true;
                  this.resultFileData = res;
                  //download result file
                  this.exportFile();
                  // this.activeModal.close();
                } else {
                  this.toastService.error(this.translate.instant('SYSTEM_ERROR'));
                }
              },
              (error) => {
                this.toastService.error(this.translate.instant('SYSTEM_ERROR'));
              },
            );
          }
        },
        (reason) => {},
      );
    }
  }

  exportFile() {
    if (this.resultFileData) {
      let now = new Date();
      let month = now.getMonth() < 9 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
      let day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
      let fileName = 'importRoutingPrice_result_' + now.getFullYear() + month + day + '.xlsx';
      // FileSaver.saveAs(data, fileName);
      this.quanLyPhieuCongTacService.saveFile(fileName, 'application/octet-stream', this.resultFileData);
    }
  }

  checkValidBeforeAddOrUpdate(): any {
    //check if record existed in DB
    const request = this.conditionSearch().subscribe((res) => {
      let isValid = false;
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        if (res.data) {
          if (res.data.length > 0) {
            if (this.id != null) {
              let itSelfItem = res.data.find((item) => item.id == this.id);
              isValid = itSelfItem ? true : false;
            } else {
              isValid = false;
            }
          } else {
            isValid = true;
          }
        } else {
          isValid = null;
        }
      } else {
        this.toastService.error(res.description);
        isValid = null;
      }

      if (isValid) {
        this.addOrUpdateRoutingPrice();
      } else {
        this.toastService.error(this.translate.instant('MESSAGE.NORM_MOVING_EXIST'));
      }
    });
    this.subscriptions.push(request);
  }

  conditionSearch() {
    const requestTarget = {
      functionName: 'searchRoutingPrice',
      method: 'POST',
      params: {
        userName: this.userName,
        routingPriceDTO: {
          fromProvinceId: this.addForm.get('tinhDi').value,
          toProvinceId: this.addForm.get('tinhDen').value,
          vehicleType: this.addForm.get('phuongTien').value,
        },
      },
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  addOrUpdateRoutingPrice() {
    if (this.isUpdate) {
      const requestTarget = {
        functionName: 'editRoutingPrice',
        method: 'POST',
        params: {
          userName: this.userName,
          routingPriceDTO: {
            id: this.id,
            fromProvinceId: this.addForm.get('tinhDi').value,
            toProvinceId: this.addForm.get('tinhDen').value,
            vehicleType: this.addForm.get('phuongTien').value,
            price: this.addForm.get('chiPhi').value.replace(/,/g, ''),
            note: this.addForm.get('ghiChu').value,
          },
        },
      };
      this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
        if (res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.UPDATE_NORM_MOVES_SUCCESS'));
          this.activeModal.close();
        } else {
          this.toastService.error(res.description);
        }
      });
    } else {
      const requestTarget = {
        functionName: 'addRoutingPrice',
        method: 'POST',
        params: {
          userName: this.userName,
          routingPriceDTO: {
            fromProvinceId: this.addForm.get('tinhDi').value,
            toProvinceId: this.addForm.get('tinhDen').value,
            vehicleType: this.addForm.get('phuongTien').value,
            price: this.addForm.get('chiPhi').value,
            note: this.addForm.get('ghiChu').value,
          },
        },
      };
      this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
        if (res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.ADD_NORM_MOVES_SUCCESS'));
          this.activeModal.close();
        } else {
          this.toastService.error(res.description);
        }
      });
    }
  }

  eResetForm() {
    this.addForm.reset();
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  isValidFileForm(): boolean {
    let isValid = true;
    Object.keys(this.addFileForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addFileForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    return isValid;
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.addForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.addForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isControlInvalidFile(controlName: string): boolean {
    const control = this.addFileForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.addForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  controlHasErrorFile(validation, controlName): boolean {
    const control = this.addFileForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.addForm.controls[controlName];
    return control.dirty || control.touched;
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  control(controlName: string): AbstractControl {
    return this.addForm.controls[controlName];
  }

  controlFile(controlName: string): AbstractControl {
    return this.addFileForm.controls[controlName];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
