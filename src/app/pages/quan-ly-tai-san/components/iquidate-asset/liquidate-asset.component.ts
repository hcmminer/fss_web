import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RequestApiModelOld } from 'src/app/pages/_models/requestOld-api.model';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { CONFIG } from 'src/app/utils/constants';
import { FormAddLiquidateAssetComponent } from './form-add-iquidate-asset/form-add-liquidate-asset.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { LiquidateOldAssetComponent } from './liquidate-old-asset/liquidate-old-asset.component';

const queryInit = {
  groupFilter: '',
  typeOfAssetCode: '',
  organisation: '',
  sourceOfAsset: '',
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
  selector: 'app-liquidate-asset',
  templateUrl: './liquidate-asset.component.html',
  styleUrls: ['./liquidate-asset.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class LiquidateAssetComponent implements OnInit {
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
  @ViewChild('updateRefuse') updateRefuse: ElementRef;
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
    'index',
    'parentAssetCode',
    'assetCode',
    'constructionDateStr',
    'createdDatetimeStr',
  ];
  public dataChange = false;
  public totalRecord = new BehaviorSubject<any>(0);
  public showTotalPages = new BehaviorSubject<any>(0);
  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public openingBalanceService: openingBalanceService,
    // public commonServiceOld: CommonServiceOld,
    public toastrService: ToastrService,
    private globalService: GlobalService,
    @Inject(Injector) private readonly injector: Injector,
  ) {
    this.loadSearchForm();
  }

  initCombobox() {
    let reqGetListStatus = { userName: this.userName };
    this.openingBalanceService.getListOrganisation(reqGetListStatus, 'get-list-organisation', true);
    this.openingBalanceService.getSourceOfAsset(reqGetListStatus, 'get-source-of-asset', true);
    this.openingBalanceService.getCbxTypeOfAsset(reqGetListStatus, 'getCbxTypeOfAsset', true);
    this.openingBalanceService.getCbxAssetCodeIncrease(reqGetListStatus, 'search-dep-increase');
  }

  ngOnInit(): void {
    this.initCombobox();
    this.paginator._intl.itemsPerPageLabel = this.translate.instant('LABEL.PER_PAGE_LABEL');
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.isAdmin = this.userRes.isAdmin;
    this.eSearch();
  }

  eChangeDate(event) {
    if (event.target.value === '') {
      this.startDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('DATE.FROM_DATE'),
      });
      return;
    }
    let tempStartDate = this.transform(this.searchForm.get('start').value);
    if (tempStartDate === null || tempStartDate === undefined) {
      this.startDateErrorMsg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('DATE.FROM_DATE'),
      });
      return;
    }
    this.startDateErrorMsg = '';
  }


  // init data for view form search
  loadSearchForm() {
    this.searchForm = this.fb.group({
      groupFilter: [this.query.groupFilter],
      organisation: [this.query.organisation],
      sourceOfAsset: [this.query.sourceOfAsset],
      start: [this.query.startDate],
      end: [this.query.endDate],
    });
  }

  eViewDetail(item: any) {
    // console.log('view detail', item);
    // const modalRef = this.modalService.open(ViewDetailOpenBalanceComponent, {
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
        this.dataChange = !this.dataChange;
        this.openingBalanceService.listLiquidateAsset.next(res.data);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listLiquidateAsset.value);
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalRecord.next(res.totalSuccess);
        this.showTotalPages.next(
          Math.ceil(res.totalSuccess / this.pageSize) <= 5 ? Math.ceil(res.totalSuccess / this.pageSize) : 5,
        );
      } else {
        this.openingBalanceService.listLiquidateAsset.next([]);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listLiquidateAsset.value);
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
        departmentCode: this.searchForm.get('organisation').value,
        fromConstructionDateStr: this.transform(this.searchForm.get('start').value),
        toConstructionDateStr: this.transform(this.searchForm.get('end').value),
        sourceOfAsset: this.searchForm.get('sourceOfAsset').value,
        pageSize: this.pageSize,
        pageNumber: this.currentPage,
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'search-dep-liquidate');
  }

  eResetForm() {
    this.query = {
      ...queryInit,
    };
    this.startDateErrorMsg = '';
    this.loadSearchForm();
  }

  displayFormAdd(item: any, isTransferByFile) {
    const modalRef = this.modalService.open(FormAddLiquidateAssetComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.isTransferByFile = isTransferByFile;
    const requestTarget = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        departmentCode: this.searchForm.get('organisation').value,
        fromConstructionDateStr: this.transform(this.searchForm.get('start').value),
        toConstructionDateStr: this.transform(this.searchForm.get('end').value),
        sourceOfAsset: this.searchForm.get('sourceOfAsset').value,
      },
    };
    modalRef.componentInstance.req = requestTarget;
    modalRef.result.then((result) => {
      this.eSearch();
      this.initCombobox();
    });
  }

  //display form old liquidate
  displayFormAddOld(){
    const modalRef = this.modalService.open(LiquidateOldAssetComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    const requestTarget = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        departmentCode: this.searchForm.get('organisation').value,
        fromConstructionDateStr: this.transform(this.searchForm.get('start').value),
        toConstructionDateStr: this.transform(this.searchForm.get('end').value),
        sourceOfAsset: this.searchForm.get('sourceOfAsset').value,
      },
    };
    modalRef.componentInstance.req = requestTarget;
    modalRef.result.then((result) => {
      this.eSearch();
      this.initCombobox();
    });
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
      this.eSearch();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
