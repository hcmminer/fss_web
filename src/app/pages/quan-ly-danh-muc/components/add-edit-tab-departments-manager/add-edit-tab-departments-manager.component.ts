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
import { CategoryManagerService } from 'src/app/pages/_services/category-manager.service';

const MAX_FILE_SIZE_TEMPLATE = 1024 * 1024 * 10;

@Component({
  selector: 'app-add-edit-tab-departments-manager',
  templateUrl: './add-edit-tab-departments-manager.component.html',
  styleUrls: ['./add-edit-tab-departments-manager.component.scss'],
})
export class AddEditTabDepartmentsManagerComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @Output() reloadDataEvent = new EventEmitter<any>();
  addForm: FormGroup;
  addFileForm: FormGroup;
  isLoading$ = false;
  userRes: any;
  userName: any;
  isUpdate: boolean = false;

  shopId;
  shopCode;
  shopType = 1;// fix cứng do yêu cầu BE
  status;
  provinceId = '';
  shopName;

  addTypeList = [
    {
      value: 'single',
      name: this.translate.instant('LABEL.INPUT_SINGLE'),
      checked: true,
    },
    // {
    //   value: 'file',
    //   name: this.translate.instant('LABEL.UPLOAD_FILE'),
    //   checked: false,
    // },
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
    public categoryManagerService: CategoryManagerService,
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
  // xac thuc form
  loadAddForm() {
    this.addForm = this.fb.group({
      shopCode: [this.shopCode, [Validators.required]],
      shopType: [this.shopType],
      provinceId: [this.provinceId, [Validators.required]],
      shopName: [this.shopName, [Validators.required]],
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
  }

  eCloseWithoutEdit() {
    this.activeModal.dismiss();
  }
  // download excell mẫu
  getTemplate() {
    this.categoryManagerService.downloadTemplate().subscribe((x) => {
      var blob = new Blob([x], { type: '' });
      var elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = 'IMPORT_ROUTING_PRICE_TMP.xlsx';
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    });
  }
  //
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
        message: this.isUpdate ? this.translate.instant('CONFIRM.UPDATE_SHOP') : this.translate.instant('CONFIRM.ADD_SHOP'),
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
        message: this.translate.instant('MESSAGE.UPLOAD_FILE_NORM_MOVE'),
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
      this.categoryManagerService.saveFile(fileName, 'application/octet-stream', this.resultFileData);
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
            if (this.shopId != null) {
              let itSelfItem = res.data.find((item) => item.shopId == this.shopId);
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
        this.addOrUpdateShop();
      } else {
        this.toastService.error(this.translate.instant('MESSAGE.SHOP_EXIST'));
      }
    });
    this.subscriptions.push(request);
  }

  conditionSearch() {
    const requestTarget = {
      functionName: 'searchShop',
      method: 'POST',
      params: {
        userName: this.userName,
        shopDTO: {
          shopCode: this.addForm.get('shopCode').value,
          // status: this.addForm.get('status').value,
          // shopType: this.addForm.get('shopType').value,
          // provinceId: this.addForm.get('provinceId').value,
          // shopName: this.addForm.get('shopName').value,
        },
      },
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  addOrUpdateShop() {
    if (this.isUpdate) {
      const requestTarget = {
        functionName: 'editShop',
        method: 'POST',
        params: {
          userName: this.userName,
          shopDTO: {
            shopId: this.shopId,
            shopCode: this.addForm.get('shopCode').value,
            shopType:this.shopType,
            provinceId: this.addForm.get('provinceId').value,
            shopName: this.addForm.get('shopName').value,
          },
        },
      };
      this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
        if (res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.UPDATE_SHOP_SUCCESS'));
          this.activeModal.close();
        } else {
          this.toastService.error(res.description);
        }
      });
    } else {
      const requestTarget = {
        functionName: 'addShop',
        method: 'POST',
        params: {
          userName: this.userName,
          shopDTO: {
            shopCode: this.addForm.get('shopCode').value,
            shopType: this.shopType,
            provinceId: this.addForm.get('provinceId').value,
            shopName: this.addForm.get('shopName').value,
          },
        },
      };
      this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
        if (res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.ADD_SHOP_SUCCESS'));
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
