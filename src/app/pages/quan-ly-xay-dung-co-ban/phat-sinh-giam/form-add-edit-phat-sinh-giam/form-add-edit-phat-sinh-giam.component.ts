import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe, formatNumber } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RequestApiModelOld } from 'src/app/pages/_models/requestOld-api.model';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { CONFIG } from 'src/app/utils/constants';
import { timeToName } from 'src/app/utils/functions';

const MAX_FILE_SIZE_TEMPLATE = 1024 * 1024 * 10;
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
  selector: 'app-form-add-edit-phat-sinh-giam',
  templateUrl: './form-add-edit-phat-sinh-giam.component.html',
  styleUrls: ['./form-add-edit-phat-sinh-giam.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FormAddEditPhatSinhGiamComponent implements OnInit {
  //biến
  req;
  isUpdate;
  isUpdateFile;
  item;
  @Output() closeContent = new EventEmitter<any>();
  @ViewChild('popupMessage') popupMessage: ElementRef;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  magicButtonUpdate: boolean = false;
  dataSource: MatTableDataSource<any>;
  isErrorFile: boolean = false;
  isHasSuccessFile: boolean = false;
  constructionDateErrorMsg = '';
  valueChange: boolean = false;
  dataNullErr: boolean = false;
  currentPage = 1;
  pageSize;
  resultDesc;
  resultCode: string;
  userName: any;
  addEditForm: FormGroup;
  addFileForm: FormGroup;
  addType: string = 'single';
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
  private subscriptions: Subscription[] = [];
  selectedFile: any = null;
  resultFileData: any = null;
  totalSuccess: number = null;
  totalRecord: number = null;
  isHasResult: boolean = false;
  columnsToDisplay: any;
  modelChanged = new Subject<string>();
  //

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
    this.openingBalanceService.getListAssetCodeDecrease(reqGetListStatus, 'get-list-asset-code-decrease');
  }

  ngOnInit(): void {
    this.initCombobox();
    this.modelChanged.pipe(debounceTime(800)).subscribe((value) => {
      let reqGetListStatus = { userName: this.userName };
      this.openingBalanceService.getListAssetCodeDecrease(reqGetListStatus, 'get-list-asset-code-decrease', value);
    });
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    if (this.isUpdateFile) {
      this.columnsToDisplay = [
        'index',
        'assetCode',
        'materialTotalStr',
        'materialStr',
        'laborTotalStr',
        'laborStr',
        'constructionDateStr',
        'errorMsg',
      ];
      this.addType = 'file';
      this.loadAddFileForm();
    } else {
      this.columnsToDisplay = [
        'index',
        'assetCode',
        'typeOfAssetCode',
        'material',
        'labor',
        'constructionDateStr',
        'errorMsg',
      ];
    }

    if (this.isUpdate) {
      this.loadAddForm();
      let request = this.apiGetSum().subscribe(
        (res) => {
          if (res.errorCode == '0') {
            this.addEditForm.get('totalMaterial').patchValue(formatNumber(+res.data.material, 'en-US', '1.0'));
            this.addEditForm.get('totalLabor').patchValue(formatNumber(+res.data.labor, 'en-US', '1.0'));
            console.log(this.addEditForm);
          } else if (res.errorCode == '1') {
            this.toastService.error(res.description);
          } else {
            this.toastService.error(res.description);
          }
        },
        (error) => {
          this.toastService.error(this.translate.instant('SYSTEM_ERROR'));
        },
      );
      this.subscriptions.push(request);
    } else {
      this.loadAddForm();
    }
  }

  loadAddForm() {
    this.addEditForm = this.fb.group({
      assetCode: [this.isUpdate ? this.item.assetCode : '', [Validators.required]],
      constructionDateStr: [
        this.isUpdate ? moment(this.item.constructionDateStr, 'DD/MM/YYYY').toDate() : new Date(),
        [Validators.required],
      ],
      material: ['', [Validators.required, Validators.maxLength(18)]],
      labor: ['', [Validators.required, Validators.maxLength(18)]],
      totalMaterial: [''],
      totalLabor: [''],
      typeOfAssetCode: [this.isUpdate ? this.item.typeOfAssetCode : '', [Validators.required]],
    });
  }

  loadAddFileForm() {
    this.addFileForm = this.fb.group({
      chonFile: [null, [Validators.required]],
    });
  }

  // lấy tổng material và labor
  apiGetSum() {
    const req = {
      userName: this.userName,
      constructionDTO: {
        assetCode: this.item.assetCode,
      },
    };
    return this.globalService.globalApi(req, 'get-bc-decrease-sum-current');
  }

  //change page
  onPaginateChange(event) {
    if (event) {
      this.currentPage = event.pageIndex;
      this.pageSize = event.pageSize;
    }
  }

  //check input date
  eChangeDate(event) {
    if (event.target.value === '') {
      this.constructionDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('LABEL.CONSTRUCTION_DATE'),
      });
      return;
    }
    let tempStartDate = this.transform(this.addEditForm.get('constructionDateStr').value);
    if (tempStartDate === null || tempStartDate === undefined) {
      this.constructionDateErrorMsg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('LABEL.CONSTRUCTION_DATE'),
      });
      return;
    }
    this.constructionDateErrorMsg = '';
  }
  displayFnAssetCode(item: any): string {
    return item ? item.assetCode : undefined;
  }
  //filter
  filterByAssetCode() {
    this.modelChanged.next(this.addEditForm.get('assetCode').value);
  }

  handleClose() {
    this.closeContent.emit(true);
  }

  closeDialog() {
    this.activeModal.close();
  }

  openModal(_content) {
    this.modalService.open(_content, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      centered: true,
    });
  }
  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addEditForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addEditForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    if (this.constructionDateErrorMsg !== '') {
      isValid = false;
    }
    return isValid;
  }

  changeState() {
    if (this.addType == 'single') {
      this.loadAddForm();
    } else {
      this.loadAddFileForm();
    }
  }

  conditionAddEdit() {
    const requestTarget = {
      userName: this.userName,
      constructionDTO: {
        assetCode: !this.addEditForm.get('assetCode').value.assetCode
          ? this.addEditForm.get('assetCode').value
          : this.addEditForm.get('assetCode').value.assetCode,
        constructionDateStr: this.transform(this.addEditForm.get('constructionDateStr').value),
        material: Number(this.addEditForm.get('material').value.replaceAll(',', '')),
        labor: Number(this.addEditForm.get('labor').value.replaceAll(',', '')),
        materialTotal: Number(this.addEditForm.get('totalMaterial').value.replaceAll(',', '')),
        laborTotal: Number(this.addEditForm.get('totalLabor').value.replaceAll(',', '')),
        typeOfAssetCode: this.addEditForm.get('typeOfAssetCode').value,
      },
    };
    if (this.isUpdate) {
      return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'update-bc-decrease-single');
    }
    return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'add-bc-decrease-single');
  }

  //thay đổi format date
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }

  //add hoặc edit
  save() {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.isUpdate
        ? this.translate.instant('CONFIRM.UPDATE_DECREASE')
        : this.translate.instant('CONFIRM.ADD_DECREASE'),
      continue: true,
      cancel: true,
      btn: [
        { text: this.translate.instant('CANCEL'), className: 'btn-outline-warning btn uppercase mx-2' },
        { text: this.translate.instant('CONTINUE'), className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        let request = this.conditionAddEdit().subscribe((res) => {
          if (res.errorCode === '0') {
            this.toastrService.success(
              this.isUpdate
                ? this.translate.instant('COMMON.MESSAGE.UPDATE_SUCCESS')
                : this.translate.instant('COMMON.MESSAGE.CREATE_SUCCESS'),
            );
            this.activeModal.close();
            this.handleClose();
          } else {
            this.toastrService.error(res.description);
            this.handleClose();
          }
        });
        this.subscriptions.push(request);
      },
      (reason) => {},
    );
  }

  //theo file
  apiGetTemplate() {
    let req;
    if (this.isUpdateFile) {
      req = this.req;
    } else {
      req = {
        userName: this.userName,
      };
    }
    return this.globalService.globalApi(
      req,
      this.isUpdateFile ? 'down-temp-update-bc-decrease' : 'down-temp-add-bc-decrease',
    );
  }
  getTemplate() {
    const sub = this.apiGetTemplate().subscribe((res) => {
      if (res.errorCode == '0') {
        this.toastService.success(this.translate.instant('COMMON.MESSAGE.DOWNLOAD_SUCCESS'));
        this.spinner.hide();
        const byteCharacters = atob(res.dataExtension);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: res.extension });
        const urlDown = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = urlDown;
        link.download = `Template_${timeToName(new Date())}.${res.extension}`; // đặt tên file tải về
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(sub);
  }

  eUpdateFromFile() {
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
      title: 'MODAL_WARNING',
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
        this.resultFileData = null;
        const formData: FormData = new FormData();
        formData.append('fileCreateRequest', this.selectedFile);
        const requestTarget = {
          params: {
            userName: this.userName,
          },
          formData: formData,
        };

        this.dataSource = new MatTableDataSource([]);
        let request = this.globalService
          .globalApi(requestTarget, this.isUpdateFile ? 'update-bc-decrease-by-file' : 'add-bc-decrease-by-file')
          .subscribe(
            (res) => {
              if (res.errorCode == '0') {
                this.toastService.success(this.translate.instant('MESSAGE.UPLOAD_FILE_SC'));
                this.openingBalanceService.errBcDecreaseList.next(res.data);
                this.dataSource = new MatTableDataSource(this.openingBalanceService.errBcDecreaseList.value);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                let isError = res.data.find((item) => item.errorMsg != '');
                this.totalSuccess = res.data.filter((item) => item.errorMsg == '').length;
                this.totalRecord = res.data.length;
                this.isHasResult = true;
                if (isError) {
                  this.openingBalanceService.getErrBcDecreaseFile.next(res);
                  this.isErrorFile = true;
                } else {
                  this.openingBalanceService.getErrBcDecreaseFile.next(null);
                  this.isErrorFile = false;
                }
                this.magicButtonUpdate = isError ? false : true;
                this.dataNullErr = false;
              } else if (res.errorCode == '1') {
                this.isHasResult = true;
                this.totalSuccess = 0;
                this.totalRecord = 0;
                this.isErrorFile = true;
                this.dataNullErr = true;
                this.toastService.error(res.description);
              } else {
                this.toastService.error(res.description);
              }
            },
            (error) => {
              this.toastService.error(this.translate.instant('SYSTEM_ERROR'));
            },
          );
        this.subscriptions.push(request);
      },
      (reason) => {},
    );
  }

  //confirm file
  apiCofirmUpdateByFile() {
    const req = {
      userName: this.userName,
      listConstructionDTO: this.openingBalanceService.errBcDecreaseList.value,
    };
    return this.globalService.globalApi(
      req,
      this.isUpdateFile ? 'confirm-update-bc-decrease-by-file' : 'confirm-add-bc-decrease-by-file',
    );
  }

  eDownloadFileSuccess() {
    const sub = this.openingBalanceService.getSuccessBcDecreaseFile.subscribe((res) => {
      if (res.errorCode == '0' || res.errorCode == '3') {
        this.toastService.success(this.translate.instant('COMMON.MESSAGE.DOWNLOAD_SUCCESS'));
        this.spinner.hide();
        const byteCharacters = atob(res.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: res.extension });
        const urlDown = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = urlDown;
        link.download = `file_success_${timeToName(new Date())}.${res.extension}`; // đặt tên file tải về
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(sub);
  }

  eCofirmUpdateByFile() {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'MODAL_WARNING',
      message: this.isUpdateFile
        ? this.translate.instant('MESSAGE.CF_UPDATE_DECREASE_BY_FILE')
        : this.translate.instant('MESSAGE.CF_ADD_DECREASE_BY_FILE'),
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
        if (this.openingBalanceService.errBcDecreaseList.value.find((item) => item.errorMsg == '')) {
          const sub = this.apiCofirmUpdateByFile().subscribe((res) => {
            if (res.errorCode == '0') {
              this.isHasSuccessFile = true;
              this.openingBalanceService.getSuccessBcDecreaseFile.next(res);
              this.resultDesc = res.description;
              this.resultCode = 'success';
              this.toastService.success(
                this.isUpdateFile
                  ? this.translate.instant('MESSAGE.UPDATE_DECREASE_FROM_FILE_SC')
                  : this.translate.instant('MESSAGE.ADD_DECREASE_FROM_FILE_SC'),
              );
            } else if (res.errorCode == '3') {
              this.resultDesc = res.description;
              this.resultCode = 'warning';
              this.isHasSuccessFile = true;
              this.openingBalanceService.getSuccessBcDecreaseFile.next(res);
              this.toastService.warning(this.resultDesc);
            } else {
              this.isHasSuccessFile = false;
              this.openingBalanceService.getSuccessBcDecreaseFile.next(null);
              this.toastService.error(this.translate.instant('SYSTEM_ERROR'));
            }
          });
          this.subscriptions.push(sub);
        }
      },
      (reason) => {},
    );
  }

  eDownloadErrFile() {
    const sub = this.openingBalanceService.getErrBcDecreaseFile.subscribe((res) => {
      if (res.errorCode == '0') {
        this.toastService.success(this.translate.instant('COMMON.MESSAGE.DOWNLOAD_SUCCESS'));
        this.spinner.hide();
        const byteCharacters = atob(res.dataExtension);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: res.extension });
        const urlDown = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = urlDown;
        link.download = `file_error_${timeToName(new Date())}.${res.extension}`; // đặt tên file tải về
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(sub);
  }

  onFileSelected(event: any): void {
    this.validateFile(event);
    this.selectedFile = event.target.files[0] ?? null;
    this.resultFileData = null;
    this.magicButtonUpdate = false;
    this.totalRecord = 0;
    this.dataSource = new MatTableDataSource([]);
    this.isHasResult = false;
  }

  validateFile(event: any) {
    let file = event.target.files[0];

    //check định dạng
    let allowedType: string[] = ['xls', 'xlsx'];
    let fileExtension: string = file.name.substring(file.name.lastIndexOf('.') + 1);
    if (!allowedType.includes(fileExtension)) {
      this.toastService.error(
        this.translate.instant('VALIDATION.FILE_INVALID_EXTENSION', {
          0: '.xls, .xlsx',
        }),
      );
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

  //check number
  isNumber(amountApproved: any) {
    return Number(amountApproved);
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

  onFileResset(event: any): void {
    event.target.value = null;
  }

  eCloseWithoutEdit() {
    this.activeModal.close();
  }

  isControlInvalidFile(controlName: string): boolean {
    const control = this.addFileForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasErrorFile(validation, controlName): boolean {
    const control = this.addFileForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
