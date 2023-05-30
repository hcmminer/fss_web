import { ViewHisOpenDepComponent } from './view-his-open-dep/view-his-open-dep.component';
import { AssetManageService } from './../../../_services/asset-manage.service';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CONFIG } from 'src/app/utils/constants';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { RequestApiModel } from 'src/app/pages/_models/api.request.model';
import { AddEditLoaiTaiSanComponent } from '../loai-tai-san/add-edit-loai-tai-san/add-edit-loai-tai-san.component';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { AeOpenDepComponent } from './ae-open-dep/ae-open-dep.component';
import { AeByFileOpenDepComponent } from './ae-by-file-open-dep/ae-by-file-open-dep.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

const queryInit = {
  groupFilter: '',
  organisation: '',
  typeOfAssetCode: '',
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
  selector: 'app-open-dep',
  templateUrl: './open-dep.component.html',
  styleUrls: ['./open-dep.component.scss'],
  providers: [
    {
      provide: DateAdapter, 
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class OpenDepComponent implements OnInit {
  // >> search advance
  @ViewChild('searchInput') private _inputElement: ElementRef;
  source: any;
  ngAfterViewInit(): void {
    this.source = fromEvent(this._inputElement.nativeElement, 'keyup');
    this.source.pipe(debounceTime(400)).subscribe(() => {
      this.eSearch();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }
  // advance <<
  private subscriptions: Subscription[] = [];

  dataSource: MatTableDataSource<any>;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('updateRefuse') updateRefuse: ElementRef;

  startDateErrorMsg = '';
  endDateErrorMsg = '';
  searchForm: FormGroup;
  userRes: any;
  userName: string;
  query = {
    ...queryInit,
  };
  columnsToDisplay = [
    'index',
    'parentAssetCode',
    'assetCode',
    'departmentCode',
    // 'typeOfAssetCode',
    'typeOfAssetName',
    'depreciationFrame',
    'sourceOfAssetName',
    'beginOriginalAmount',
    'beginAmount',
    'depreciationStartDateStr',
    'depreciationEndDateStr',
    'isUpdate',
    'action',
  ];

  constructor(
    public assetManageService: AssetManageService,
    private globalService: GlobalService,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastrService: ToastrService,
    private activeModal: NgbActiveModal,
    public openingBalanceService: openingBalanceService,
    @Inject(Injector) private readonly injector: Injector,
  ) {
    this.loadSearchForm();
  }

  ngOnInit(): void {
    this.paginator._intl.itemsPerPageLabel = this.translate.instant('LABEL.PER_PAGE_LABEL');
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.eSearch();
    this.initCombobox();
  }

  initCombobox() {
    let reqTar = { userName: this.userName };
    this.openingBalanceService.getListOrganisation(reqTar, 'get-list-organisation', true);
    this.openingBalanceService.getCbxTypeOfAsset(reqTar, 'getCbxTypeOfAsset', true);
    this.openingBalanceService.getSourceOfAsset(reqTar, 'get-source-of-asset', true);
  }

  
  loadSearchForm() {
    this.searchForm = this.fb.group({
      groupFilter: [this.query.groupFilter],
      organisation: [this.query.organisation],
      typeOfAssetCode: [this.query.typeOfAssetCode],
      sourceOfAsset: [this.query.sourceOfAsset],
      start: [this.query.startDate],
      end: [this.query.endDate],
    });
  }

  onOrganisationChange() {
    this.eSearch();
  }

  ontypeOfAssetChange() {
    this.eSearch();
  }
  onSourceOfAssetChange() {
    this.eSearch();
  }

  eViewDetail(item: any) {
    const modalRef = this.modalService.open(ViewHisOpenDepComponent, {
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

  httpSearch() {
    const requestTarget = {
      userName: this.userName,
      searchDTO: {
        groupFilter: this.query.groupFilter,
        departmentCode: this.searchForm.get('organisation').value,
        fromConstructionDateStr: this.transform(this.searchForm.get('start').value),
        toConstructionDateStr: this.transform(this.searchForm.get('end').value),
        typeOfAssetCode: this.searchForm.get('typeOfAssetCode').value,
        sourceOfAsset: this.searchForm.get('sourceOfAsset').value,
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModel, 'search-open-dep');
  }

  eSearch() {
    const rq = this.httpSearch().subscribe((res) => {
      if (res.errorCode == '0') {
        this.assetManageService.listOpenDep.next(res.data);
        this.dataSource = new MatTableDataSource(this.assetManageService.listOpenDep.value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.assetManageService.listOpenDep.next([]);
        this.dataSource = new MatTableDataSource(this.assetManageService.listOpenDep.value);
      }
    });
    this.subscriptions.push(rq);
  }

  eResetForm() {
    this.query = {
      ...queryInit,
    };
    this.startDateErrorMsg = '';
    // this.loadSearchForm();
  }

  eRenderAeOpenDepComponent(action, record) {
    const modalRef = this.modalService.open(AeOpenDepComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    if (action == 'add') {
      modalRef.componentInstance.propAction = 'add';
    } else if (action == 'update') {
      modalRef.componentInstance.propData = record;
      modalRef.componentInstance.propAction = 'update';
    }
    modalRef.result.then(() => {
      this.eSearch();
    });
  }

  eRenderAeByFileOpenDepComponent(action, record) {
    const modalRef = this.modalService.open(AeByFileOpenDepComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    if (action == 'adds') {
      modalRef.componentInstance.propAction = 'adds';
    } else if (action == 'updates') {
      modalRef.componentInstance.propData = record;
      modalRef.componentInstance.propAction = 'updates';
      // organisation: this.query.organisation,
      // typeOfAssetCode: this.query.typeOfAsset,
      // groupFilter: this.query.groupFilter,
      modalRef.componentInstance.searchDTO = {
        groupFilter: this.query.groupFilter,
        departmentCode: this.searchForm.get('organisation').value,
        fromConstructionDateStr: this.transform(this.searchForm.get('start').value),
        toConstructionDateStr: this.transform(this.searchForm.get('end').value),
        typeOfAssetCode: this.searchForm.get('typeOfAssetCode').value,
        sourceOfAsset: this.searchForm.get('sourceOfAsset').value,
      };
    }
    modalRef.result.then(() => {
      this.eSearch();
    });
  }

  httpDelete(item) {
    const requestTarget = {
      userName: this.userName,
      typeOfAssetDTO: {
        id: item.id,
      },
    };
    return this.globalService.globalApi(requestTarget as RequestApiModel, 'removeTypeOfAsset');
  }

  // common modal confirm alert
  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('FUNCTION.CONFIRM_DELETE'),
      continue: true,
      cancel: true,
      btn: [
        { text: this.translate.instant('CANCEL'), className: 'btn-outline-warning btn uppercase mx-2' },
        { text: this.translate.instant('CONTINUE'), className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      () => {
        let request = this.httpDelete(item).subscribe((res) => {
          if (res.errorCode === '0') {
            this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_DELETE'));
            // this.activeModal.close();
            this.eSearch();
          } else {
            this.toastrService.error(res.description);
          }
        });
        this.subscriptions.push(request);
      },
      () => {},
    );
  }

  // helpers for View
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
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
  
  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
