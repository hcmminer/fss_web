import { Component, ElementRef, EventEmitter, Inject, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { CONFIG } from 'src/app/utils/constants';
import { RequestApiModelOld } from 'src/app/pages/_models/requestOld-api.model';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { DatePipe, formatNumber } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { timeToName } from 'src/app/utils/functions';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import * as moment from 'moment';

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
  selector: 'app-ae-by-file-open-dep',
  templateUrl: './ae-by-file-open-dep.component.html',
  styleUrls: ['./ae-by-file-open-dep.component.scss'],
})
export class AeByFileOpenDepComponent implements OnInit {
  // ban>>
  propAction;
  propData;
  // <<ban
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
  valueChange: boolean = false;
  dataNullErr: boolean = false;
  currentPage = 1;
  pageSize;
  resultDesc;
  resultCode: string;
  userName: any;
  addFileForm: FormGroup;
  private subscriptions: Subscription[] = [];
  selectedFile: any = null;
  resultFileData: any = null;
  totalSuccess: number = null;
  totalRecord: number = null;
  isHasResult: boolean = false;
  columnsToDisplay: any;

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

  ngOnInit(): void {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    if (this.propAction == 'adds') {
      this.columnsToDisplay = [
        'index',
        'constructionDateStr',
        'organisation',
        'typeOfAssetCode',
        'sourceOfAsset',
        'assetCode',
        'beginOriginalAmountStr',
        'beginAmountStr',
        'depreciationStartDateStr',
        'errorMsg',
      ];

      this.loadAddFileForm();
    } else if (this.propAction == 'updates') {
      this.columnsToDisplay = [
        'index',
        'constructionDateStr',
        'assetCode',
        'beginOriginalAmountTotalStr',
        'beginOriginalAmountStr',
        'beginAmountTotalStr',
        'beginAmountStr',
        'errorMsg',
      ];
    }
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
    return this.globalService.globalApi(req, 'get-bc-open-sum-current');
  }

  //change page
  onPaginateChange(event) {
    if (event) {
      this.currentPage = event.pageIndex;
      this.pageSize = event.pageSize;
    }
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

  //thay đổi format date
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
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
      this.isUpdateFile ? 'down-temp-update-bc-opening' : 'down-temp-add-bc-opening',
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
          .globalApi(requestTarget, this.isUpdateFile ? 'update-bc-opening-by-file' : 'add-bc-opening-by-file')
          .subscribe(
            (res) => {
              if (res.errorCode == '0') {
                this.toastService.success(this.translate.instant('MESSAGE.UPLOAD_FILE_SC'));
                this.openingBalanceService.errOpeningBalanceList.next(res.data);
                this.dataSource = new MatTableDataSource(this.openingBalanceService.errOpeningBalanceList.value);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                let isError = res.data.find((item) => item.errorMsg != '');
                this.totalSuccess = res.data.filter((item) => item.errorMsg == '').length;
                this.totalRecord = res.data.length;
                this.isHasResult = true;
                if (isError) {
                  this.openingBalanceService.getErrOpeningBalanceFile.next(res);
                  this.isErrorFile = true;
                } else {
                  this.openingBalanceService.getErrOpeningBalanceFile.next(null);
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
      listConstructionDTO: this.openingBalanceService.errOpeningBalanceList.value,
    };
    return this.globalService.globalApi(
      req,
      this.isUpdateFile ? 'confirm-update-bc-opening-by-file' : 'confirm-add-bc-opening-by-file',
    );
  }

  eDownloadFileSuccess() {
    const sub = this.openingBalanceService.getSuccessOpeningBalanceFile.subscribe((res) => {
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
        ? this.translate.instant('MESSAGE.CF_UPDATE_OP_BL_BY_FILE')
        : this.translate.instant('MESSAGE.CF_ADD_OP_BL_BY_FILE'),
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
        if (this.openingBalanceService.errOpeningBalanceList.value.find((item) => item.errorMsg == '')) {
          const sub = this.apiCofirmUpdateByFile().subscribe((res) => {
            if (res.errorCode == '0') {
              this.isHasSuccessFile = true;
              this.openingBalanceService.getSuccessOpeningBalanceFile.next(res);
              this.resultDesc = res.description;
              this.resultCode = 'success';
              this.toastService.success(
                this.isUpdateFile
                  ? this.translate.instant('MESSAGE.UPDATE_OP_BL_FROM_FILE_SC')
                  : this.translate.instant('MESSAGE.ADD_OP_BL_FROM_FILE_SC'),
              );
            } else if (res.errorCode == '3') {
              this.resultDesc = res.description;
              this.resultCode = 'warning';
              this.isHasSuccessFile = true;
              this.openingBalanceService.getSuccessOpeningBalanceFile.next(res);
              this.toastService.warning(this.translate.instant('MESSAGE.UPDATE_OP_BL_FROM_FILE_SC'));
            } else {
              this.isHasSuccessFile = false;
              this.openingBalanceService.getSuccessOpeningBalanceFile.next(null);
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
    const sub = this.openingBalanceService.getErrOpeningBalanceFile.subscribe((res) => {
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
