import { OnDestroy } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { CommonService } from 'src/app/pages/_services/common.service';
import { QuanLyPhieuCongTacService } from 'src/app/pages/_services/quanLyPhieuCongTac.service';
import { CONFIG } from 'src/app/utils/constants';
import {
  AddEditTabQuanLyCongTacPhiComponent
} from "../add-edit-tab-quan-ly-cong-tac-phi/add-edit-tab-quan-ly-cong-tac-phi.component";
import {BusinessFeeDTO} from "../../../_models/quan-ly-phieu-cong-tac.model";
import {RequestApiModel} from "../../../_models/request-api.model";
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-tab-quan-ly-cong-tac-phi',
  templateUrl: './tab-quan-ly-cong-tac-phi.component.html',
  styleUrls: ['./tab-quan-ly-cong-tac-phi.component.scss']
})
export class TabQuanLyCongTacPhiComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private subscriptions: Subscription[] = [];
  businessFeeDTO: BusinessFeeDTO[] = null;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
  startDateErrorMsg: string = '';
  endDateErrorMsg: string = '';
  isLoading$: boolean = false;
  userRes: any;
  staffId: number;
  isAdmin: any;
  isViewingDetail: boolean = false;
  selectedPhieuCongTac: any;
  userName: string;
  columnsToDisplay = [
    'index',
    'chucDanh',
    'amount',
    'ghiChu',
    'hanhDong'
  ];

  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    public spinner: NgxSpinnerService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector
  ) { }

  ngOnInit(): void {
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.getListPosition();
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
  getListPosition() {
    let requestPosition = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'TITLE'
        }
      }
    };
    this.quanLyPhieuCongTacService.getListPositionBox(requestPosition, true);
  }
  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.DELETE_NORM_BUSINESS_FEE'),
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
            functionName: 'removeBusinessFee',
            method: 'POST',
            params: {
              userName: this.userName,
              businessFeeDTO: {
                id: item.id
              }
            }
          };
          const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
            if (res.errorCode == '0') {
              this.toastService.success(this.translate.instant('MESSAGE.DELETE_BUSINESS_FEE_SUCCESS'));
              this.eSearch();
            } else {
              this.toastService.error(res.description);
            }
          });
          this.subscriptions.push(request);
        },
        reason => {

        }
    );
  }
  eSave(item, isUpdate) {
    const modalRef = this.modalService.open(AddEditTabQuanLyCongTacPhiComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl'
    });

    if(isUpdate) {
      modalRef.componentInstance.isUpdate = true;
      modalRef.componentInstance.id = item.id;
      modalRef.componentInstance.chucDanh = item.title;
      modalRef.componentInstance.chiPhi = formatNumber(+item.amount, 'en-US', '1.0');
      modalRef.componentInstance.ghiChu = item.note;
    } else {
      modalRef.componentInstance.isUpdate = false;
    }

    modalRef.result.then(
      result => {
        this.eSearch();
      }
    );
  }
  eSearch() {
    this.isLoading$ = true;
    const request = this.conditionSearch().subscribe(res => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.quanLyPhieuCongTacService.listBusinessFee.next(res.data);
        this.dataSource = new MatTableDataSource<BusinessFeeDTO>(this.quanLyPhieuCongTacService.listBusinessFee.value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(request);
  }

  conditionSearch() {
    const requestTarget = {
      functionName: 'searchBusinessFee',
      method: 'POST',
      params: {
      }
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
