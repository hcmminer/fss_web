import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RequestApiModelOld } from 'src/app/pages/_models/requestOld-api.model';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { CONFIG } from 'src/app/utils/constants';
import { timeToName } from 'src/app/utils/functions';

const queryInit = {
  groupFilter: '',
  organisation: '',
  typeOfAssetName: '',
  // assetCode: '',
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  date: moment(),
  // iValidStartDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
  // iValidEndDate: new NgbDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

@Component({
  selector: 'app-report-asset',
  templateUrl: './report-asset.component.html',
  styleUrls: ['./report-asset.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ReportAssetComponent implements OnInit {
  currentPage = 1;
  @ViewChild('autoFocus') private _inputElement: ElementRef;
  pageSize: number = 10;
  source: any;
  ngAfterViewInit(): void {
    this.source = fromEvent(this._inputElement.nativeElement, 'keyup');
    this.source.pipe(debounceTime(400)).subscribe((value) => {
      this.eSearch();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }
  dataSource: MatTableDataSource<any>;

  private subscriptions: Subscription[] = [];
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  searchForm: FormGroup;

  @ViewChild('formSearch') formSearch: ElementRef;
  startDetailDateErrorMsg = '';
  endDateErrorMsg = '';
  endDetailDateErrorMsg = '';
  dateErrorMsg = '';
  isLoading$ = false;
  userRes: any;
  userName: string;
  staffId: number;
  isAdmin: any;
  selectedTabIndex = 0;
  private modal: any;

  reportTypeToChangeTable = 1;
  reportType = [
    { id: 1, reportName: 'LABEL.SYNTHESIS_REPORT' },
    { id: 2, reportName: 'LABEL.DETAILED_REPORT' },
    { id: 3, reportName: 'LABEL.GROUP_REPORT' },
  ];
  query = {
    ...queryInit,
  };
  maxDate = new Date();
  // cbxStatusAppraisal = [];
  columnsToDisplay = [
    'index',
    'departmentCode',
    'assetCode',
    'sourceOfAsset',
    'depreciationFrame',
    'depreciationStartDateStr',
    'issueDateStr',
    'sodauky',
    'phatsinhtang',
    'phatsinhgiam',
    'soducuoiky',
    'beginOriginalAmount',
    'beginAmount',
    'beginAvailable',
    'increaseOriginalAmount',
    'increaseAmount',
    'increaseAvailable',
    'decreaseOriginalAmount',
    'decreaseAmount',
    'decreaseAvailable',
    'endOriginalAmount',
    'endAmount',
    'endAvailable',
  ];
  public dataChange = false;
  public totalRecord = new BehaviorSubject<any>(0);
  public showTotalPages = new BehaviorSubject<any>(0);
  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
    public openingBalanceService: openingBalanceService,
    // public commonServiceOld: CommonServiceOld,
    public toastrService: ToastrService,
    private globalService: GlobalService,
    public spinner: NgxSpinnerService,
    @Inject(Injector) private readonly injector: Injector,
  ) {
    this.loadSearchForm();
  }

  initCombobox() {
    let reqGetListStatus = { userName: this.userName };
    this.openingBalanceService.getListOrganisation(reqGetListStatus, 'get-list-organisation', true);
    this.openingBalanceService.getCbxTypeOfAsset(reqGetListStatus, 'getCbxTypeOfAsset', true);
  }

  ngOnInit(): void {
    this.initCombobox();
    this.paginator._intl.itemsPerPageLabel = this.translate.instant('LABEL.PER_PAGE_LABEL');
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.isAdmin = this.userRes.isAdmin;
    this.eSearch();
  }

  //set date khi con picker
  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.searchForm.get('date').value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.searchForm.get('date').setValue(ctrlValue);
    this.maxMonthValidator();
    if(this.maxMonthValidator() != null ){
      this.dateErrorMsg = this.translate.instant('VALIDATION.MAX_MONTH');
      datepicker.close();
      return;
    }
    this.dateErrorMsg = '';
    datepicker.close();
  }

  //check max month
  maxMonthValidator(){
    if(this.searchForm.get('date').value != '' && this.searchForm.get('date').value != null && this.searchForm.get('date').value != undefined ){
      const selectedDate = this.searchForm.get('date').value;
      const currentDate = moment();
      const currentYear = currentDate.year();
      const currentMonth = currentDate.month();
    
      // Lấy tháng và năm của giá trị được chọn
      const selectedYear = selectedDate.year();
      const selectedMonth = selectedDate.month();
    
      if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
        return true; // Giá trị không hợp lệ
      }
    
      return null; // Giá trị hợp lệ
    }
    
  }

  //su kien date input thay đổi
  eChangeDate(event) {
    if (event.target.value === '') {
      this.dateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('LABEL.REPORT_MONTH'),
      });
      return;
    }
    let tempDate= this.transform(this.searchForm.get('date').value);
    if (tempDate === null || tempDate === undefined) {
      this.dateErrorMsg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('LABEL.REPORT_MONTH'),
      });
      return;
    }
    if(this.maxMonthValidator() != null ){
      this.dateErrorMsg = this.translate.instant('VALIDATION.MAX_MONTH');
      return;
    }
    
    this.dateErrorMsg = '';
  }

  //lấy ngày bắt đầu kết thúc
  getFirstAndLastDayOfMonth(selectedMonth) {
    const year = selectedMonth.year(); // Năm
    const month = selectedMonth.month(); // Tháng (0-11), 5 tương đương tháng 6
    
    const startOfMonth = moment({ year, month }).startOf('month');
    const endOfMonth = moment({ year, month }).endOf('month');
    
    this.searchForm.get('startDetail').setValue(startOfMonth.format('DD/MM/YYYY'));
    this.searchForm.get('endDetail').setValue(endOfMonth.format('DD/MM/YYYY'));
  }

  // init data for view form search
  loadSearchForm() {
    this.searchForm = this.fb.group({
      date:[this.query.date, [Validators.required]],
      groupFilter: [this.query.groupFilter],
      organisation: [this.query.organisation],
      typeOfAssetName: [this.query.typeOfAssetName],
      // assetCode: [this.query.assetCode],
      startDetail: [this.query.startDate],
      end: [this.query.endDate],
      endDetail: [this.query.endDate],
      reportType: 1,
    });
  }

  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }


  eSearch() {
    this.reportTypeToChangeTable = +this.searchForm.get('reportType').value;
    if (!this.isValidForm()) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.getFirstAndLastDayOfMonth(this.searchForm.get('date').value);

    const rq = this.conditionSearch().subscribe((res) => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.dataChange = !this.dataChange;
        this.openingBalanceService.listDataReport.next(res.data);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listDataReport.value);
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalRecord.next(res.totalSuccess);
        this.showTotalPages.next(
          Math.ceil(res.totalSuccess / this.pageSize) <= 5 ? Math.ceil(res.totalSuccess / this.pageSize) : 5,
        );
      } else {
        this.openingBalanceService.listDataReport.next([]);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listDataReport.value);
        this.totalRecord.next(0);
        this.showTotalPages.next(0);
      }
    });
    this.subscriptions.push(rq);
  }

  conditionSearch() {
    const requestTarget = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        // assetCode: this.searchForm.get('assetCode').value,
        typeOfAssetName: this.searchForm.get('typeOfAssetName').value,
        organisation: this.searchForm.get('organisation').value,
        fromDateStr: this.searchForm.get('startDetail').value,
        toDateStr: this.searchForm.get('endDetail').value,
        reportType: +this.searchForm.get('reportType').value,
        pageSize: this.pageSize,
        pageNumber: this.currentPage,
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'search-report-dep');
  }

  eResetForm() {
    this.query = {
      ...queryInit,
    };
    this.startDetailDateErrorMsg = '';
    this.endDateErrorMsg = '';
    this.endDetailDateErrorMsg = '';
    this.loadSearchForm();
  }

  //event change report type

  apiGetReport() {
    let req;

    req = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        // assetCode: this.searchForm.get('assetCode').value,
        typeOfAssetName: this.searchForm.get('typeOfAssetName').value,
        organisation: this.searchForm.get('organisation').value,
        fromDateStr: this.searchForm.get('startDetail').value,
        toDateStr: this.searchForm.get('endDetail').value,
        reportType: this.searchForm.get('reportType').value,
      },
    };
    return this.globalService.globalApi(req, 'export-dep-synthesis-report');
  }

  report() {
    const sub = this.apiGetReport().subscribe((res) => {
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

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
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
      const controlErrors: ValidationErrors = this.searchForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    if (this.dateErrorMsg !== '') {
      isValid = false;
    }

    return isValid;
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  searchControl(controlName: string) {
    return this.searchForm.controls[controlName];
  }

  onPaginateChange(event) {
    if (event) {
      console.log('🚀evnent (page) :', event);
      this.currentPage = event.pageIndex + 1;
      this.pageSize = event.pageSize;
      this.eSearch();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
