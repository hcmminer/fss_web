import { OnDestroy } from '@angular/core';
import { QuanLyPhieuCongTacService } from '../../_services/quanLyPhieuCongTac.service';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription} from 'rxjs';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RequestApiModel } from '../../_models/request-api.model';
import { CONFIG } from 'src/app/utils/constants';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../_services/common.service';
import { getDateInputWithFormat } from 'src/app/utils/functions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonAlertDialogComponent } from '../../common/common-alert-dialog/common-alert-dialog.component';
import { KetThucPhieuCongTacComponent } from '../ket-thuc-phieu-cong-tac/ket-thuc-phieu-cong-tac.component';
import { PreviewPdfComponent } from '../../common/preview-pdf/preview-pdf.component';

const queryInit = {
  maPhieuCongTac: '',
  tenPhieuCongTac: '',
  startDate: getDateInputWithFormat(new NgbDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1
  )),
  iValidStartDate: new NgbDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1
  ),
  endDate: getDateInputWithFormat(new NgbDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  )),
  iValidEndDate: new NgbDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  ),
  trangThaiKyVO: '',
  trangThaiJob: ''
};

const queryInitLoTrinh = {
  tenLoTrinh: '',
  startDateLoTrinh: getDateInputWithFormat(
    new NgbDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    )
  ),
  iValidStartDateLoTrinh: new NgbDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  ),
  endDateLoTrinh: getDateInputWithFormat(
    new NgbDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    )
  ),
  iValidEndDateLoTrinh: new NgbDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  ),
  tinhDi: '',
  tinhDen: '',
  donViDi: '',
  donViDen: '',
  dauMoiNhanSu: '',
  doiTac: '',
  // ghiChu: "",
};

@Component({
  selector: 'app-danh-sach-phieu-cong-tac',
  templateUrl: './danh-sach-phieu-cong-tac.component.html',
  styleUrls: ['./danh-sach-phieu-cong-tac.component.scss']
})
export class DanhSachPhieuCongTacComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  dataSourceLoTrinh: MatTableDataSource<any>;

  private subscriptions: Subscription[] = [];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginatorDetail') paginatorDetail: MatPaginator;
  @ViewChild(MatSort) sortDetail: MatSort;
  searchForm: FormGroup;
  loTrinhForm: FormGroup;

  @ViewChild('formSearch') formSearch: ElementRef;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
  startDateErrorMsg = '';
  endDateErrorMsg = '';
  startDateLoTrinhErrorMsg = '';
  endDateLoTrinhErrorMsg = '';
  isLoading$ = false;
  userRes: any;
  userName: string;
  staffId: number;
  isAdmin: any;
  isHandlingLoTrinhCongTac = false;
  isViewingDetail = false;
  selectedTabIndex = 0;
  typeActionVoffice: number;
  currentPage = 0;
  currentLoTrinhPage = 0;
  cindex: number;
  nIndex: number;
  query = {
    ...queryInit
  };

  queryLoTrinh = {
    ...queryInitLoTrinh
  };

  columnsToDisplay = [
    'index',
    'code',
    'name',
    'createdDatetime',
    'purposeName',
    'staffName',
    'shopName',
    'businessEstimateAmount',
    'hotelEstimateAmount',
    'routingEstimateAmount',
    'otherEstimateAmount',
    'statusName',
    'signVofficeStatusName',
    'hanhDong'
  ];

  columnsToDisplayLoTrinh = [
    'index',
    'name',
    'fromDate',
    'toDate',
    'startProvinceName',
    'endProvinceName',
    'fromShopName',
    'toShopName',
    'businessEstimateAmount',
    'hotelEstimateAmount',
    'routingEstimateAmount',
    'otherEstimateAmount'
  ];

  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector
  ) {
    this.loadSearchForm();
  }

  ngOnInit(): void {
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.staffId = this.userRes.staffId;
    this.isAdmin = this.userRes.isAdmin;
    this.initDataBox();
    this.eSearch();
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  applyDetailFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceLoTrinh.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceLoTrinh.paginator) {
      this.dataSourceLoTrinh.paginator.firstPage();
    }
  }
  initDataBox() {
    // Init all needed comboboxs's data

    // SIGN VOFFICE STATUS
    const requestVOStatus = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'SIGN_VO_STATUS'
        }
      }
    };
    this.quanLyPhieuCongTacService.getListSignVOStatusBox(requestVOStatus, true);
    
    const requestStatus = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'JOB_REQUEST_STATUS'
        }
      }
    };
    this.quanLyPhieuCongTacService.getListJobStatusBox(requestStatus, true);
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      maPhieuCongTac: [this.query.maPhieuCongTac],
      tenPhieuCongTac: [this.query.tenPhieuCongTac],
      iValidStartDate: [this.query.iValidStartDate],
      iValidEndDate: [this.query.iValidEndDate],
      trangThaiKyVO: [this.query.trangThaiKyVO],
      trangThaiJob: [this.query.trangThaiJob]
    });
  }

  eSearch() {
    if (!this.isValidForm()) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.query.startDate = getDateInputWithFormat(this.query.iValidStartDate);
    this.query.endDate = getDateInputWithFormat(this.query.iValidEndDate);
    this.isLoading$ = true;
    const rq = this.conditionSearch().subscribe(res => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.currentPage = 0;
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isHandlingLoTrinhCongTac = false;
        this.isViewingDetail = false;
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(rq);
    this.cindex = null;
    this.nIndex = null;
  }

  conditionSearch() {
    const requestTarget = {
      functionName: 'searchMannagerJobRequest',
      method: 'POST',
      params: {
        userName: this.userName,
        jobRequestDTO: {
          advanceStaffId: this.userRes.staffDTO.staffId,
          code: this.query.maPhieuCongTac,
          name: this.query.tenPhieuCongTac,
          fromDate: this.query.startDate,
          toDate: this.query.endDate,
          signVofficeStatus: this.query.trangThaiKyVO == '' ? null : +this.query.trangThaiKyVO,
          status: this.query.trangThaiJob == '' ? null : +this.query.trangThaiJob
        }
      }
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  viewTextPopup(type, title, content) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type,
      title,
      message: content,
      close: true,
      btn: [
        { text: 'CLOSE', className: type == 'ERROR' ? 'btn-outline-danger btn uppercase mx-2' : type == 'WARNING' ? 'btn-outline-warning btn uppercase mx-2' : 'btn-outline-success btn uppercase mx-2'},
      ],
    };
  }

  eViewSignedFile(signVofficeId) {
    if (signVofficeId) {
      const requestTarget = {
        functionName: 'previewSignFile',
        method: 'GET',
        params: {
          signVofficeId: signVofficeId
        }
      };
  
      const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
        if (res.errorCode == '0') {
          const byteArray = new Uint8Array(atob(res.data).split('').map(char => char.charCodeAt(0)));
          const data = window.URL.createObjectURL(new Blob([byteArray], {type: 'application/pdf'}));
  
          const modalRef = this.modalService.open(PreviewPdfComponent, {
            centered: true,
            backdrop: 'static',
            windowClass: 'big-size-model-class modal-preview-pdf'
          });
          modalRef.componentInstance.srcPreviewPdf = data;
        } else {
          this.toastService.error(res.description);
        }
      });
      this.subscriptions.push(rq);
    } else {
      this.toastService.error("Sign VOffice ID cannot null");
    }
  }

  eFinishJob(item) {
    if (!this.isEnabledFinishJob(item)) return;

    const modalRef = this.modalService.open(KetThucPhieuCongTacComponent, {
      centered: true,
      backdrop: "static",
      size: "xl",
    });

    modalRef.componentInstance.jobRequestId = item.jobRequestId;
    modalRef.componentInstance.jobRequestCode = item.code;
    modalRef.componentInstance.jobRequestName = item.name;
    modalRef.componentInstance.status = item.status;

    modalRef.result.then(
      (result) => {
        // this.eSearch();
      },
      (reason) => {}
    );
  }

  viewLoTrinhCongTac(item) {
    this.cindex = item.jobRequestId;
    if (item.signVofficeStatus != 1 && item.signVofficeStatus != 3){
      item.isSign = false;
    }else {item.isSign = true; }
    this.quanLyPhieuCongTacService.selectedPhieuCongTac = item;
    this.isHandlingLoTrinhCongTac = true;
    this.loadLoTrinhForm();
    this.eResetLoTrinhForm();
    this.eSearchLoTrinhCongTac();
    this.onLoTrinhPaginateChange(this.paginatorDetail);

  }

  loadLoTrinhForm() {
    this.loTrinhForm = this.fb.group({
      tenLoTrinh: [this.queryLoTrinh.tenLoTrinh, [Validators.required]],
      iValidStartDateLoTrinh: [this.queryLoTrinh.iValidStartDateLoTrinh, [Validators.required]],
      iValidEndDateLoTrinh: [this.queryLoTrinh.iValidEndDateLoTrinh, [Validators.required]],
      tinhDi: [this.queryLoTrinh.tinhDi, [Validators.required]],
      tinhDen: [this.queryLoTrinh.tinhDen, [Validators.required]],
      donViDi: [this.queryLoTrinh.donViDi, [Validators.required]],
      donViDen: [this.queryLoTrinh.donViDen, [Validators.required]],
      dauMoiNhanSu: [this.queryLoTrinh.dauMoiNhanSu],
      doiTac: [this.queryLoTrinh.doiTac],
      // ghiChu: [this.queryLoTrinh.ghiChu]
    });
  }

  onLoTrinhTabChanged($event) {
    this.selectedTabIndex = $event.index;
    if (this.selectedTabIndex == 0) {
      // add new

    } else if (this.selectedTabIndex == 1) {
      // sign voffice
      this.isViewingDetail = false;
      this.quanLyPhieuCongTacService.selectedLoTrinhCongTac = null;
      this.eHandleSignVOffice(this.quanLyPhieuCongTacService.selectedPhieuCongTac.signVofficeStatus);
    }
  }

  eHandleSignVOffice(signVofficeStatus) {
    switch (signVofficeStatus) {
      case null:
      case 0:
      case 2:
        this.typeActionVoffice = 1; // sign voffice
        break;
      case 1:
      case 3:
        this.typeActionVoffice = 2; // view voffice file
        break;
    }
  }

  eRefuse(item){
    if (!this.isEnabledRefuseJob(item)) { return; }

    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.REFUSE_SIGN_JOB'),
      continue: true,
      cancel: true,
      btn: [
        {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
        {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
      ],
      enableConfirmInputText: true,
      requiredConfirmInputText: true,
      requiredErrorMessage: this.translate.instant('REQUIRED.REASON_REFUSE'),
      confirmInputTextPlaceHolder: this.translate.instant('REQUIRED.INPUT_REASON_REFUSE')
    };
    modalRef.result.then(
      result => {
        const requestTarget = {
          functionName: 'rejectJobRequest',
          method: 'POST',
          params: {
            userName: this.userName,
            jobRequestDTO: {
              jobRequestId: item.jobRequestId,
              rejectReason: result
            }
          }
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.REFUSE_JOB_SUCCESS'));
            this.eSearch();
          } else {
            this.toastService.error(res.description);
            this.eSearch();
          }
        });
        this.subscriptions.push(rq);
      },
      reason => {
      }
    );
  }

  eDelete(item) {
    if (item.signVofficeStatus == 3) { return; }

    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.DELETE_JOB'),
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
          functionName: 'removeJobRequest',
          method: 'POST',
          params: {
            userName: this.userName,
            jobRequestDTO: {
              jobRequestId: item.jobRequestId
            }
          }
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_SUCCESS'));
            this.eSearch();
          } else {
            this.toastService.error(res.description);
            this.eSearch();
          }
        });
        this.subscriptions.push(rq);
      },
      reason => {
      }
    );
  }

  eResetForm() {
    this.query = {
      ...queryInit
    };
  }

  eResetLoTrinhForm() {
    this.queryLoTrinh = {
      ...queryInitLoTrinh
    };
  }

  eSearchLoTrinhCongTac() {
    // lấy thông tin danh sách lộ trình công tác đã thêm
    const requestTarget = {
      functionName: 'detailJobRequest',
      method: 'POST',
      params: {
        userName: this.userName,
        jobRequestDTO: {
          jobRequestId : this.quanLyPhieuCongTacService.selectedPhieuCongTac.jobRequestId
        }
      }
    };
    const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.currentLoTrinhPage = 0;
        this.dataSourceLoTrinh = new MatTableDataSource(res.data.listJobRoutingDTO);
        this.dataSourceLoTrinh.paginator = this.paginatorDetail;
        this.dataSourceLoTrinh.sort = this.sortDetail;
        this.isViewingDetail = false;
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(rq);
  }

  eThemLoTrinh() {
    if (!this.isValidLoTrinhForm()) {
      this.loTrinhForm.markAllAsTouched();
      return;
    }

    this.queryLoTrinh.startDateLoTrinh = getDateInputWithFormat(this.queryLoTrinh.iValidStartDateLoTrinh);
    this.queryLoTrinh.endDateLoTrinh = getDateInputWithFormat(this.queryLoTrinh.iValidEndDateLoTrinh);

    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.ADD_ROUTE_JOB'),
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
          functionName: 'addJobRouting',
          method: 'POST',
          params: {
            userName: this.userName,
            jobRoutingDTO: {
              jobRequestId: this.quanLyPhieuCongTacService.selectedPhieuCongTac.jobRequestId,
              fromShopId: this.queryLoTrinh.donViDi,
              toShopId: this.queryLoTrinh.donViDen,
              partnerStaffId: this.queryLoTrinh.dauMoiNhanSu,
              partnerName: this.queryLoTrinh.doiTac,
              startProvinceId: this.queryLoTrinh.tinhDi,
              endProvinceId: this.queryLoTrinh.tinhDen,
              fromDate: this.queryLoTrinh.startDateLoTrinh,
              toDate: this.queryLoTrinh.endDateLoTrinh,
              name: this.queryLoTrinh.tenLoTrinh
            }
          }
        };
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.ADD_SUCCESS'));
            this.loadLoTrinhForm();
            this.eResetLoTrinhForm();
            this.eSearchLoTrinhCongTac();
          } else {
            this.toastService.error(res.description);
            this.eSearchLoTrinhCongTac();
          }
        });
        this.subscriptions.push(rq);
      },
      reason => {
      }
    );
  }
  
  viewDetail(item) {
    this.nIndex = item.id;
    this.quanLyPhieuCongTacService.selectedLoTrinhCongTac = item;
    this.isViewingDetail = true;
    this.initDetailDataBox();
    this.getDetailData();
  }

  initDetailDataBox() {
    
  }

  getDetailData() {
    // DETAIL JOB ROUTING
    const requestDetailJobRouting = {
      functionName: 'detailJobRouting',
      method: 'POST',
      params: {
        userName: this.userName,
        jobRoutingDTO: {
          id: this.quanLyPhieuCongTacService.selectedLoTrinhCongTac.id
        }
      }
    };
    this.quanLyPhieuCongTacService.getListDetailJobRoutingData(requestDetailJobRouting);

  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isControlInvalidLoTrinh(controlName: string): boolean {
    const control = this.loTrinhForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.searchForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.searchForm.controls[controlName];
    return control.dirty || control.touched;
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.searchForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.searchForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    if (this.startDateErrorMsg !== '' || this.endDateErrorMsg !== '') {
      isValid = false;
    }

    return isValid;
  }

  isValidLoTrinhForm(): boolean {
    let isValid = true;
    Object.keys(this.loTrinhForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.loTrinhForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    if (this.startDateLoTrinhErrorMsg !== '' || this.endDateLoTrinhErrorMsg !== '') {
      isValid = false;
    }

    return isValid;
  }

  isControlInvalidDate(controlName: string): boolean {
    switch (controlName){
      case 'iValidStartDate':
        this.startDateErrorMsg = '';
        if (this.query.iValidStartDate == undefined || this.query.iValidStartDate == null || (typeof this.query.iValidStartDate == 'string' && this.query.iValidStartDate == '')) {
          this.startDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {name: this.translate.instant('DATE.FROM_DATE')});
          return true;
        } else if (typeof this.query.iValidStartDate == 'string') {
          let iValidStartDateStr: string = this.query.iValidStartDate;
          if (/^[0-9]{8}$/.test(iValidStartDateStr)) {
            iValidStartDateStr = [iValidStartDateStr.substr(0, 2),
              iValidStartDateStr.substr(2, 2),
              iValidStartDateStr.substr(4, 4)].join('/');
            if (!this.isValidDateForm(iValidStartDateStr)) {
              this.startDateErrorMsg = this.translate.instant('VALIDATION.INVALID', {name: this.translate.instant('DATE.FROM_DATE')});
              return true;
            }
          } else {
            this.startDateErrorMsg = this.translate.instant('VALIDATION.INVALID', {name: this.translate.instant('DATE.FROM_DATE')});
            return true;
          }
        } else if (this.query.iValidStartDate && typeof this.query.iValidStartDate == 'object') {
          // check <= current date
          const currentDate = new Date();
          const currentNgbDate = new NgbDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          if (this.afterDate(this.query.iValidStartDate, currentNgbDate)) {
            this.startDateErrorMsg = this.translate.instant('VALIDATION.AFTER_CURRENT_DATE', {name: this.translate.instant('DATE.FROM_DATE')});
            return true;
          }

          // check fromDate <= toDate
          if (this.query.iValidEndDate && typeof this.query.iValidEndDate == 'object'
            && this.afterDate(this.query.iValidStartDate, this.query.iValidEndDate)) {
            this.startDateErrorMsg = this.translate.instant('VALIDATION.FROM_DATE_BEFORE_TO_DATE');
            return true;
          }
        }
        return false;

      case 'iValidEndDate':
        this.endDateErrorMsg = '';
        if (this.query.iValidEndDate == undefined || this.query.iValidEndDate == null || (typeof this.query.iValidEndDate == 'string' && this.query.iValidEndDate == '')) {
          this.endDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {name: this.translate.instant('DATE.TO_DATE')});
          return true;
        } else if (typeof this.query.iValidEndDate == 'string') {
          let iValidEndDateStr: string = this.query.iValidEndDate;
          if (/^[0-9]{8}$/.test(iValidEndDateStr)) {
            iValidEndDateStr = [iValidEndDateStr.substr(0, 2),
              iValidEndDateStr.substr(2, 2),
              iValidEndDateStr.substr(4, 4)].join('/');
            return !this.isValidDateForm(iValidEndDateStr);
          } else {
            this.endDateErrorMsg = this.translate.instant('VALIDATION.INVALID', {name: this.translate.instant('DATE.TO_DATE')});
            return true;
          }
        } else if (this.query.iValidEndDate && typeof this.query.iValidEndDate == 'object') {
          // check <= current date
          const currentDate = new Date();
          const currentNgbDate = new NgbDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          if (this.afterDate(this.query.iValidEndDate, currentNgbDate)) {
            this.endDateErrorMsg = this.translate.instant('VALIDATION.AFTER_CURRENT_DATE', {name: this.translate.instant('DATE.TO_DATE')});
            return true;
          }

          // check fromDate <= toDate
          if (this.query.iValidStartDate && typeof this.query.iValidStartDate == 'object'
            && this.afterDate(this.query.iValidStartDate, this.query.iValidEndDate)) {
            this.endDateErrorMsg = this.translate.instant('VALIDATION.FROM_DATE_BEFORE_TO_DATE');
            return true;
          }
        }
        return false;

      case 'iValidStartDateLoTrinh':
        this.startDateLoTrinhErrorMsg = '';
        if (this.queryLoTrinh.iValidStartDateLoTrinh == undefined || this.queryLoTrinh.iValidStartDateLoTrinh == null || (typeof this.queryLoTrinh.iValidStartDateLoTrinh == 'string' && this.queryLoTrinh.iValidStartDateLoTrinh == '')) {
          this.startDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {name: this.translate.instant('DATE.FROM_DATE')});
          return true;
        } else if (typeof this.queryLoTrinh.iValidStartDateLoTrinh == 'string') {
          let iValidStartDateLoTrinhStr: string = this.queryLoTrinh.iValidStartDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidStartDateLoTrinhStr)) {
            iValidStartDateLoTrinhStr = [iValidStartDateLoTrinhStr.substr(0, 2),
              iValidStartDateLoTrinhStr.substr(2, 2),
              iValidStartDateLoTrinhStr.substr(4, 4)].join('/');
            if (!this.isValidDateForm(iValidStartDateLoTrinhStr)) {
              this.startDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.INVALID', {name: this.translate.instant('DATE.FROM_DATE')});
              return true;
            }
          } else {
            this.startDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.INVALID', {name: this.translate.instant('DATE.FROM_DATE')});
            return true;
          }
        } else if (this.queryLoTrinh.iValidStartDateLoTrinh && typeof this.queryLoTrinh.iValidStartDateLoTrinh == 'object') {
          // check >= current date
          const currentDate = new Date();
          const currentNgbDate = new NgbDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          if (this.afterDate(currentNgbDate, this.queryLoTrinh.iValidStartDateLoTrinh)) {
            this.startDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.BEFORE_CURRENT_DATE', {name: this.translate.instant('DATE.FROM_DATE')});
            return true;
          }

          // check fromDate <= toDate
          if (this.queryLoTrinh.iValidEndDateLoTrinh && typeof this.queryLoTrinh.iValidEndDateLoTrinh == 'object'
            && this.afterDate(this.queryLoTrinh.iValidStartDateLoTrinh, this.queryLoTrinh.iValidEndDateLoTrinh)) {
            this.startDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.FROM_DATE_BEFORE_TO_DATE');
            return true;
          }
        }
        return false;

      case 'iValidEndDateLoTrinh':
        this.endDateLoTrinhErrorMsg = '';
        if (this.queryLoTrinh.iValidEndDateLoTrinh == undefined || this.queryLoTrinh.iValidEndDateLoTrinh == null || (typeof this.queryLoTrinh.iValidEndDateLoTrinh == 'string' && this.queryLoTrinh.iValidEndDateLoTrinh == '')) {
          this.endDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {name: this.translate.instant('DATE.TO_DATE')});
          return true;
        } else if (typeof this.queryLoTrinh.iValidEndDateLoTrinh == 'string') {
          let iValidEndDateLoTrinhStr: string = this.queryLoTrinh.iValidEndDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidEndDateLoTrinhStr)) {
            iValidEndDateLoTrinhStr = [iValidEndDateLoTrinhStr.substr(0, 2),
              iValidEndDateLoTrinhStr.substr(2, 2),
              iValidEndDateLoTrinhStr.substr(4, 4)].join('/');
            return !this.isValidDateForm(iValidEndDateLoTrinhStr);
          } else {
            this.endDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.INVALID', {name: this.translate.instant('DATE.TO_DATE')});
            return true;
          }
        } else if (this.queryLoTrinh.iValidEndDateLoTrinh && typeof this.queryLoTrinh.iValidEndDateLoTrinh == 'object') {
          // check >= current date
          const currentDate = new Date();
          const currentNgbDate = new NgbDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          if (this.afterDate(currentNgbDate, this.queryLoTrinh.iValidEndDateLoTrinh)) {
            this.endDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.BEFORE_CURRENT_DATE', {name: this.translate.instant('DATE.TO_DATE')});
            return true;
          }

          // check fromDate <= toDate
          if (this.queryLoTrinh.iValidStartDateLoTrinh && typeof this.queryLoTrinh.iValidStartDateLoTrinh == 'object'
            && this.afterDate(this.queryLoTrinh.iValidStartDateLoTrinh, this.queryLoTrinh.iValidEndDateLoTrinh)) {
            this.endDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.FROM_DATE_BEFORE_TO_DATE');
            return true;
          }
        }
        return false;
    }
    return false;
  }

  afterDate(date1: NgbDate, date2: NgbDate): boolean {
    if (date1.year < date2.year) { return false; }
    else if (date1.year > date2.year) { return true; }
    else {
      if (date1.month < date2.month) { return false; }
      else if (date1.month > date2.month) { return true; }
      else {
        if (date1.day <= date2.day) { return false; }
        else { return true; }
      }
    }
  }

  isValidDateForm(dateString): boolean {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
      return false;
    }

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    if (day > 0 && day <= monthLength[month - 1]) {
      return true;
    } else {
      return false;
    }
  }

  resetError(controlName: string){
    switch (controlName){
      case 'iValidStartDate':
        this.startDateErrorMsg = '';
        break;
      case 'iValidEndDate':
        this.endDateErrorMsg = '';
        break;
      case 'iValidStartDateLoTrinh':
        this.startDateLoTrinhErrorMsg = '';
        break;
      case 'iValidEndDateLoTrinh':
        this.endDateLoTrinhErrorMsg = '';
        break;
    }
  }

  formatDateValue(controlName: string) {
    switch (controlName){
      case 'iValidStartDate':
        let iValidStartDateStr;
        if (typeof this.query.iValidStartDate == 'string') {
          iValidStartDateStr = this.query.iValidStartDate;
          if (/^[0-9]{8}$/.test(iValidStartDateStr)) {
            this.query.iValidStartDate = new NgbDate(parseInt(iValidStartDateStr.substr(4, 4)),
                parseInt(iValidStartDateStr.substr(2, 2)),
                parseInt(iValidStartDateStr.substr(0, 2)));
          }
        }
        break;
      case 'iValidEndDate':
        let iValidEndDateStr;
        if (typeof this.query.iValidEndDate == 'string') {
          iValidEndDateStr = this.query.iValidEndDate;
          if (/^[0-9]{8}$/.test(iValidEndDateStr)) {
            this.query.iValidEndDate = new NgbDate(parseInt(iValidEndDateStr.substr(4, 4)),
                parseInt(iValidEndDateStr.substr(2, 2)),
                parseInt(iValidEndDateStr.substr(0, 2)));
          }
        }
        break;
      case 'iValidStartDateLoTrinh':
        let iValidStartDateLoTrinhStr;
        if (typeof this.queryLoTrinh.iValidStartDateLoTrinh == 'string') {
          iValidStartDateLoTrinhStr = this.queryLoTrinh.iValidStartDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidStartDateLoTrinhStr)) {
            this.queryLoTrinh.iValidStartDateLoTrinh = new NgbDate(parseInt(iValidStartDateLoTrinhStr.substr(4, 4)),
                parseInt(iValidStartDateLoTrinhStr.substr(2, 2)),
                parseInt(iValidStartDateLoTrinhStr.substr(0, 2)));
          }
        }
        break;
      case 'iValidEndDateLoTrinh':
        let iValidEndDateLoTrinhStr;
        if (typeof this.queryLoTrinh.iValidEndDateLoTrinh == 'string') {
          iValidEndDateLoTrinhStr = this.queryLoTrinh.iValidEndDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidEndDateLoTrinhStr)) {
            this.queryLoTrinh.iValidEndDateLoTrinh = new NgbDate(parseInt(iValidEndDateLoTrinhStr.substr(4, 4)),
                parseInt(iValidEndDateLoTrinhStr.substr(2, 2)),
                parseInt(iValidEndDateLoTrinhStr.substr(0, 2)));
          }
        }
        break;
    }
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  searchControl(controlName: string) {
    return this.searchForm.controls[controlName];
  }

  loTrinhControl(controlName: string) {
    return this.loTrinhForm.controls[controlName];
  }

  onPaginateChange(event) {
    if (event){
     this.currentPage = event.pageIndex;
    }
  }

  onLoTrinhPaginateChange(event) {
    if (event){
      this.currentLoTrinhPage = event.pageIndex;
    }
  }

  isEnabledRefuseJob(item) {
    let validStatus = false;
    let validStatusVO = false;
    switch (item.status) {
      case 2:
        validStatus = true;
        break;
    }
    switch (item.signVofficeStatus) {
      case null:
      case 2:
        validStatusVO = true;
        break;
    }
    return validStatus && validStatusVO;
    // return item && (item.signVofficeStatus == null || item.signVofficeStatus == 2);
  }

  isEnabledFinishJob(item) {
    let validStatus = false;
    let validStatusVO = false;
    switch (item.status) {
      default:
        validStatus = true;
        break;
    }
    switch (item.signVofficeStatus) {
      case 3:
        validStatusVO = true;
        break;
    }
    return validStatus && validStatusVO;
    // return item && item.signVofficeStatus == 3;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
