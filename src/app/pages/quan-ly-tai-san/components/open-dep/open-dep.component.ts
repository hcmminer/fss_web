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

const queryInit = {
  groupFilter: '',
  organisation: '',
  typeOfAsset: '',
};

@Component({
  selector: 'app-open-dep',
  templateUrl: './open-dep.component.html',
  styleUrls: ['./open-dep.component.scss'],
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
  userRes: any;
  userName: string;
  query = {
    ...queryInit,
  };
  columnsToDisplay = [
    'index',
    'assetCode',
    'typeOfAssetCode',
    'typeOfAssetName',
    'depreciationFrame',
    'sourceOfAsset',
    'beginOriginalAmount',
    'beginAmount',
    'depreciationStartDateStr',
    'depreciationEndDateStr',
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
  ) {}

  ngOnInit(): void {
    this.paginator._intl.itemsPerPageLabel = this.translate.instant('LABEL.PER_PAGE_LABEL');
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.eSearch();
  }

  onOrganisationChange() {
    this.eSearch();
  }

  ontypeOfAssetChange() {
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
        organisation: this.query.organisation,
        typeOfAssetCode: this.query.typeOfAsset,
        groupFilter: this.query.groupFilter,
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

  eRenderComponent(action, record) {
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

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
