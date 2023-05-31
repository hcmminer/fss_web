import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { openingBalanceService } from '../../_services/opening-balance.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../../_services/global.service';
import { CONFIG } from 'src/app/utils/constants';
import { DatePipe } from '@angular/common';
import { RequestApiModelOld } from '../../_models/requestOld-api.model';
import { FormAddEditPhatSinhTangComponent } from './form-add-edit-phat-sinh-tang/form-add-edit-phat-sinh-tang.component';
import { ViewDetailImportIncreaseComponent } from './view-detail-import-increase/view-detail-import-increase.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

const queryInit = {
  groupFilter: '',
  organisation: '',
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
  selector: 'app-phat-sinh-tang',
  templateUrl: './phat-sinh-tang.component.html',
  styleUrls: ['./phat-sinh-tang.component.scss'],
  providers: [
    {
      provide: DateAdapter, 
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PhatSinhTangComponent implements OnInit {
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
    'organisationCode',
    'parentAssetCode',
    'assetCode',
    'contract',
    'labor',
    'material',
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
    this.loadSearchForm();
  }

  initCombobox() {
    let reqGetListStatus = { userName: this.userName };
    this.openingBalanceService.getListOrganisation(reqGetListStatus, 'get-list-organisation', true);
  }

  ngOnInit(): void {
    this.initCombobox()
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
      start: [this.query.startDate],
      end: [this.query.endDate],
    });
  }

  eViewDetail(item: any) {
    const modalRef = this.modalService.open(ViewDetailImportIncreaseComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
      keyboard: false,
    });
    modalRef.componentInstance.data = item;
    modalRef.result.then((result) => {
      this.eSearch();
    });
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
        this.openingBalanceService.listImportIncrease.next(res.data);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listImportIncrease.value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.openingBalanceService.listImportIncrease.next([]);
        this.dataSource = new MatTableDataSource(this.openingBalanceService.listImportIncrease.value);
      }
    });
    this.subscriptions.push(rq);
  }

  conditionSearch() {
    const requestTarget = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        organisation: this.searchForm.get('organisation').value,
        fromConstructionDateStr: this.transform(this.searchForm.get('start').value),
        toConstructionDateStr: this.transform(this.searchForm.get('end').value),
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'search-bc-increase');
  }

  eResetForm() {
    this.query = {
      ...queryInit,
    };
    this.startDateErrorMsg = '';
    this.loadSearchForm();
  }

  displayFormAdd(item: any, isUpdate, isUpdateFile) {
    const modalRef = this.modalService.open(FormAddEditPhatSinhTangComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.isUpdate = isUpdate;
    modalRef.componentInstance.isUpdateFile = isUpdateFile;
    const requestTarget = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        organisation: this.searchForm.get('organisation').value,
        fromConstructionDateStr: this.transform(this.searchForm.get('start').value),
        toConstructionDateStr: this.transform(this.searchForm.get('end').value),
      },
    };
    modalRef.componentInstance.req = requestTarget;
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
