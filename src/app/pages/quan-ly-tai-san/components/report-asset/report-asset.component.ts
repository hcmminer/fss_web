import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RequestApiModelOld } from 'src/app/pages/_models/requestOld-api.model';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { CONFIG } from 'src/app/utils/constants';
import { timeToName } from 'src/app/utils/functions';


const queryInit = {
  groupFilter: '',
  organisation: '',
  assetCode: '',
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  // iValidStartDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
  // iValidEndDate: new NgbDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
};

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
  selector: 'app-report-asset',
  templateUrl: './report-asset.component.html',
  styleUrls: ['./report-asset.component.scss']
})
export class ReportAssetComponent implements OnInit {
  currentPage = 1;
  @ViewChild('autoFocus') private _inputElement: ElementRef; // autofocus
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
  startDateErrorMsg = '';
  endDateErrorMsg = '';
  isLoading$ = false;
  userRes: any;
  userName: string;
  staffId: number;
  isAdmin: any;
  selectedTabIndex = 0;
  private modal: any;
  query = {
    ...queryInit,
  };
  // cbxStatusAppraisal = [];
  columnsToDisplay = [
    'index', 'departmentCode', 'assetCode', 'sourceOfAsset', 'depreciationFrame','depreciationStartDateStr', 'sodauky', 'phatsinhtang', 'phatsinhgiam',
    'soducuoiky', 'beginOriginalAmount', 'beginAmount', 'beginAvailable', 'increaseOriginalAmount', 'increaseAmount',
    'increaseAvailable', 'decreaseOriginalAmount', 'decreaseAmount', 'decreaseAvailable', 'endOriginalAmount', 'endAmount', 'endAvailable'
  ];

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
    this.openingBalanceService.getListAssetCodeDecrease(reqGetListStatus, 'get-list-asset-code-decrease', true);
  }

  ngOnInit(): void {
    this.initCombobox()
    this.paginator._intl.itemsPerPageLabel = this.translate.instant('LABEL.PER_PAGE_LABEL');
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.isAdmin = this.userRes.isAdmin;
    this.eSearch();

  }

  eInputDate(event: any, typeDate: string) {
    let value = event.target.value;
    if (typeof value == 'string' && value == '' && typeDate === 'start') {
      this.startDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', { name: this.translate.instant('DATE.FROM_DATE') });
    }
    if (value != '' && typeDate === 'start') {
      this.startDateErrorMsg = '';
    }
  }

  // init data for view form search
  loadSearchForm() {
    this.searchForm = this.fb.group({
      groupFilter: [this.query.groupFilter],
      organisation: [this.query.organisation],
      assetCode: [ this.query.assetCode],
      start: [this.query.startDate],
      end: [this.query.endDate],
    });
  }

  eViewDetail(item: any) {
    console.log('view detail', item);
    // const modalRef = this.modalService.open(DetailBcDecreaseComponent, {
    //   centered: true,
    //   backdrop: 'static',
    //   size: 'xl',
    //   keyboard: false,
    // });
    // modalRef.componentInstance.data = item;
    // modalRef.result.then((result) => {
    //   this.eSearch();
    // });
  }
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }
  eSearch() {
    if (!this.isValidForm()) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const rq = this.conditionSearch().subscribe((res) => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.openingBalanceService.listDataReport.next(res.data);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listDataReport.value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.openingBalanceService.listDataReport.next([]);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listDataReport.value);
      }
    });
    this.subscriptions.push(rq);
  }

  conditionSearch() {
    const requestTarget = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        assetCode: this.searchForm.get('assetCode').value,
        organisation: this.searchForm.get('organisation').value,
        fromDateStr: this.transform(this.searchForm.get('start').value),
        toDateStr: this.transform(this.searchForm.get('end').value),
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'search-report-dep');
  }

  eResetForm() {
    this.query = {
      ...queryInit,
    };
    this.startDateErrorMsg = '';
    this.loadSearchForm();
  }

  apiGetReport() {
    let req;
   
      req = {
        userName: this.userName,
        searchDTO: {
          groupFilter: this.query.groupFilter,
          assetCode: this.searchForm.get('assetCode').value,
          organisation: this.searchForm.get('organisation').value,
          fromDateStr: this.transform(this.searchForm.get('start').value),
          toDateStr: this.transform(this.searchForm.get('end').value),
        },
      }
    return this.globalService.globalApi(req, 'export-dep-synthesis-report');
  }

  report(){
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

    if (this.startDateErrorMsg !== '' || this.endDateErrorMsg !== '') {
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
      this.currentPage = event.pageIndex;
      console.log('🚀evnent (page) :', event);
      this.pageSize = event.pageSize;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
