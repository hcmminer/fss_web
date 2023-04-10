import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CONFIG } from 'src/app/utils/constants';
import { openingBalanceService } from '../../_services/opening-balance.service';
import { GlobalService } from '../../_services/global.service';
import { RequestApiModelOld } from '../../_models/requestOld-api.model';
import { FormAddEditSoDuDauKyComponent } from './form-add-so-du-dau-ky/form-add-edit-so-du-dau-ky.component';

const queryInit = {
  groupFilter: '',
  organisation: '',
  assetCode: '',
  contract: '', 
  // startDate: getDateInputWithFormat(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)),
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  iValidStartDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
  iValidEndDate: new NgbDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
};

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}

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
  selector: 'app-so-du-dau-ky',
  templateUrl: './so-du-dau-ky.component.html',
  styleUrls: ['./so-du-dau-ky.component.scss']
})
export class SoDuDauKyComponent implements OnInit {

  expandedElement: PeriodicElement | null;
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
  @ViewChild('paginatorDetail') paginatorDetail: MatPaginator;
  @ViewChild(MatSort) sortDetail: MatSort;
  @ViewChild('updateRefuse') updateRefuse: ElementRef;
  searchForm: FormGroup;

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
  currentLoTrinhPage = 0;
  private modal: any;
  query = {
    ...queryInit,
  };
  // cbxStatusAppraisal = [];
  columnsToDisplay = [
    'index',
    'assetCode',
    'contract',
    'labor',
    'material',
    'organisation',
    'constructionDateStr',
    'createdDatetimeStr',
    'action'
  ];

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
    console.log(this.openingBalanceService.cbxLoanOrganisation);
    
    this.loadSearchForm();
  }

  ngOnInit(): void {
    this.paginator._intl.itemsPerPageLabel = this.translate.instant('TRANS.PER_PAGE_LABEL');
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
      assetCode: [this.query.assetCode],
      contract: [this.query.contract],
      start: [this.query.startDate],
      end: [this.query.endDate],
    });
  }
  
  eViewTran(item: any) {
    // console.log('eViewTran', item);
    // const modalRef = this.modalService.open(ViewAppraisalComponent, {
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
        this.openingBalanceService.listOpeningBalance.next(res.data);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listOpeningBalance.value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isViewingDetail = false;
      } else {
        this.openingBalanceService.listOpeningBalance.next([]);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listOpeningBalance.value);
      }
    });
    this.subscriptions.push(rq);
  }

  conditionSearch() {
    const requestTarget = {
      userName: this.userName,
      loanTransDTO: {
        groupFilter: this.query.groupFilter,
        assetCode: this.searchForm.get('assetCode').value,
        organisation: this.searchForm.get('organisation').value,
        contract: this.searchForm.get('contract').value,
        fromCreatedDateStr: this.transform(this.searchForm.get('start').value),
        toCreatedDateStr: this.transform(this.searchForm.get('end').value),
      },
      dataParams: {
        currentPage: 1,
        pageLimit: 1000000,
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'search-bc-opening');
  }

  eResetForm() {
    this.query = {
      ...queryInit,
    };
    this.startDateErrorMsg = '';
    this.loadSearchForm();
  }

  displayPopupUpdateRefuse() {
    // const modalRef = this.modalService.open(UpdateRefuseFileComponent, {
    //   centered: true,
    //   backdrop: 'static',
    //   size: 'xl',
    // });

    // const requestTarget = {
    //   loanTransDTO: {
    //     groupFilter: this.query.groupFilter,
    //     status: this.searchForm.get('status').value,
    //     fromDate: this.transform(this.searchForm.get('start').value),
    //     toDate: this.transform(this.searchForm.get('end').value),
    //   },
    //   dataParams: {
    //     currentPage: 1,
    //     pageLimit: 1000000,
    //   },
    // };
    // modalRef.componentInstance.data = requestTarget;

    // modalRef.result.then((result) => {
    //   this.eSearch();
    // });
  }

  displayFormAdd(item:any, typeForm){
     const modalRef = this.modalService.open(FormAddEditSoDuDauKyComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });

    modalRef.componentInstance.item = item;
    modalRef.componentInstance.typeForm = typeForm;
    modalRef.result.then((result) => {
      this.eSearch();
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
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
