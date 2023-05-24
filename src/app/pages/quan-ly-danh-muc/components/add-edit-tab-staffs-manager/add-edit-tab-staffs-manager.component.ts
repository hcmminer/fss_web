import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Component, EventEmitter, Inject, Injector, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  selector: 'app-add-edit-tab-staffs-manager',
  templateUrl: './add-edit-tab-staffs-manager.component.html',
  styleUrls: ['./add-edit-tab-staffs-manager.component.scss'],
})
export class AddEditStaffsManagerComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @Output() reloadDataEvent = new EventEmitter<any>();
  addForm: FormGroup;
  addFileForm: FormGroup;
  isLoading$ = false;
  userRes: any;
  userName: any;
  isUpdate: boolean = false;

  // required
  staffId;
  staffName = '';
  gender = '';
  staffType = 1;
  shopId = '';
  position = '';
  staffCategory = '';
  // no required
  staffCode = '';
  mobile;
  provinceId = '';
  email;
  title = '';
  maxLengthMobile = 16;

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
  loadAddForm() {
    this.addForm = this.fb.group({
      staffId: [this.staffId],
      staffName: [this.staffName, [Validators.required]],
      gender: [this.gender, [Validators.required]],
      staffType: [this.staffType],
      shopId: [this.shopId, [Validators.required]],
      position: [this.position, [Validators.required]],
      staffCode: [this.staffCode, [Validators.required]],
      mobile: [this.mobile, [Validators.required, Validators.maxLength(this.maxLengthMobile)]],
      email: [this.email, [Validators.email, Validators.required]],
      provinceId: [this.provinceId, [Validators.required]],
      title: [this.title, [Validators.required]],
      staffCategory: [this.staffCategory, [Validators.required]],
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

  ressetFile(event: any): void {
    event.target.value = null;
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
  // download excell mẫu
  getTemplate() {
    this.categoryManagerService.downloadTemplateStaff().subscribe((x) => {
      var blob = new Blob([x], { type: '' });
      var elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = 'IMPORT_STAFF.xlsx';
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    });
  }
  // Save
  eSave(type) {
    // add or update 1 nhan vien
    if (type == 'single') {
      if (!this.isValidForm()) {
        this.addForm.markAllAsTouched();
        return;
      }
      // đưa ra các cảnh báo khi nhấn nút thêm mới hay close chúng
      const modalRef = this.modalService.open(CommonAlertDialogComponent, {
        centered: true,
        backdrop: 'static',
      });
      modalRef.componentInstance.data = {
        type: 'WARNING',
        title: 'COMMON_MODAL.WARNING',
        message: this.isUpdate ? this.translate.instant('CONFIRM.UPDATE_STAFF') : this.translate.instant('CONFIRM.ADD_STAFF'),
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
      // sau khi chấp nhận các cảnh báo và tiếp tục thì alert ra các lỗi về database, validate
      modalRef.result.then(
        (result) => {
          this.checkValidBeforeAddOrUpdate();
        },
        (reason) => {},
      );
    } else {
      // add nhieu nhân vien
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
        message: this.translate.instant('MESSAGE.CF_UPLOAD_FILE'),
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
              functionName: 'importStaff',
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
                  this.toastService.success(this.translate.instant('MESSAGE.UPLOAD_FILE_SC'));
                  this.totalSuccess = res.headers.get('total-success');
                  this.totalRecord = res.headers.get('total-record');
                  this.isHasResult = true;
                  this.resultFileData = res;
                  //download result file
                  this.exportFileStaff();
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
        (reason) => {console.log(reason)},
      );
    }
  }

  
  exportFileStaff() {
    if (this.resultFileData) {
      let now = new Date();
      let month = now.getMonth() < 9 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
      let day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
      let fileName = 'import_staff_result_' + now.getFullYear() + month + day + '.xlsx';
      // FileSaver.saveAs(data, fileName);
      this.categoryManagerService.saveFile(fileName, 'application/octet-stream', this.resultFileData);
    }
  }

  // kiem tra du lieu truoc khi day len api
  checkValidBeforeAddOrUpdate(): any {
    // Checking nhan vien da ton tai trong DB
    const request = this.conditionSearch().subscribe((res) => {
      let isValid = false;
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        if (res.data) {
          if (res.data.length > 0) {
            // check bang id nhan vien
            if (this.staffId != null) {
              let itSelfItem = res.data.find((item) => item.staffId == this.staffId);
              // neu nhan vien them vao DB chua ton tai tren he thong thay thi false
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
        this.addOrUpdateStaff();
      } else {
        this.toastService.error(this.translate.instant('MESSAGE.STAFF_EXIST'));
      }
    });
    this.subscriptions.push(request);
  }
  // kiem tra da ton tai staff tren DB truoc khi AU tren DB
  conditionSearch() {
    const requestTarget = {
      functionName: 'searchStaff',
      method: 'POST',
      params: {
        userName: this.userName,
        staffDTO: {
          // required
          // staffName: this.addForm.get('staffName').value,
          // gender: this.addForm.get('gender').value,
          // staffType: this.addForm.get('staffType').value,
          // shopId: this.addForm.get('shopId').value,
          // position: this.addForm.get('position').value,
          // no required
          staffCode: this.addForm.get('staffCode').value,
          // mobile: this.addForm.get('mobile').value,
          // provinceId: this.addForm.get('provinceId').value,
          // email: this.addForm.get('email').value,
          // title: this.addForm.get('title').value,
          // staffCodeNumber: this.addForm.get('staffCodeNumber').value,
        },
      },
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  addOrUpdateStaff() {
    if (this.isUpdate) {
      const requestTarget = {
        functionName: 'editStaff',
        method: 'POST',
        params: {
          userName: this.userName,
          staffDTO: {
            // required
            // staffId: this.staffId,
            // required
            staffId: this.addForm.get('staffId').value,
            staffName: this.addForm.get('staffName').value,
            gender: this.addForm.get('gender').value,
            staffType: this.addForm.get('staffType').value,
            shopId: this.addForm.get('shopId').value,
            position: this.addForm.get('position').value,
            staffCategory: this.addForm.get('staffCategory').value,
            // no required
            staffCode: this.addForm.get('staffCode').value,
            mobile: this.addForm.get('mobile').value,
            provinceId: this.addForm.get('provinceId').value,
            email: this.addForm.get('email').value,
            title: this.addForm.get('title').value,
          },
        },
      };
      this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
        if (res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.UPDATE_STAFF_SUCCESS'));
          this.activeModal.close();
        } else {
          this.toastService.error(res.description);
        }
      });
    } else {
      // them moi
      const requestTarget = {
        functionName: 'addStaff',
        method: 'POST',
        params: {
          userName: this.userName,
          staffDTO: {
            // required
            staffName: this.addForm.get('staffName').value,
            gender: this.addForm.get('gender').value,
            staffType: this.addForm.get('staffType').value,
            shopId: this.addForm.get('shopId').value,
            position: this.addForm.get('position').value,
            staffCategory: this.addForm.get('staffCategory').value,
            // no required
            staffCode: this.addForm.get('staffCode').value,
            mobile: this.addForm.get('mobile').value,
            provinceId: this.addForm.get('provinceId').value,
            email: this.addForm.get('email').value,
            title: this.addForm.get('title').value,
          },
        },
      };
      this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
        if (res.errorCode == '0') {
          this.toastService.success(this.translate.instant('MESSAGE.ADD_STAFF_SUCCESS'));
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
