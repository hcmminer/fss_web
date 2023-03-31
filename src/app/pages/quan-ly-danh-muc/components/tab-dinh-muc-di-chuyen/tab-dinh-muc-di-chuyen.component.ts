import { AddEditTabDinhMucDiChuyenComponent } from './../add-edit-tab-dinh-muc-di-chuyen/add-edit-tab-dinh-muc-di-chuyen.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, Inject, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { CommonService } from 'src/app/pages/_services/common.service';
import { QuanLyPhieuCongTacService } from 'src/app/pages/_services/quanLyPhieuCongTac.service';
import { CONFIG } from 'src/app/utils/constants';
import { BusinessFeeDTO, RoutingPriceDTO } from '../../../_models/quan-ly-phieu-cong-tac.model';
import { RequestApiModel } from '../../../_models/request-api.model';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-tab-dinh-muc-di-chuyen',
  templateUrl: './tab-dinh-muc-di-chuyen.component.html',
  styleUrls: ['./tab-dinh-muc-di-chuyen.component.scss'],
})
export class TabDinhMucDiChuyenComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  searchForm: FormGroup;
  private subscriptions: Subscription[] = [];
  businessFeeDTO: BusinessFeeDTO[] = null;
  @ViewChild('formSearch') formSearch: ElementRef;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
  isLoading$: boolean = false;
  userRes: any;
  userName: string;
  columnsToDisplay = ['index', 'startProvinceName', 'toProvinceName', 'vehicleTypeName', 'price', 'note', 'hanhDong'];

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
    @Inject(Injector) private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.getListVehicle();
    this.loadSearchForm();
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
  getListVehicle() {
    let requestVehicle = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'VEHICLE_TYPE',
        },
      },
    };
    this.quanLyPhieuCongTacService.getListVehicleBox(requestVehicle, true);
  }
  loadSearchForm() {
    this.searchForm = this.fb.group({
      tinhDi: ['', []],
      tinhDen: ['', []],
      phuongTien: ['', []],
    });
  }
  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.DELETE_NORM_MOVE'),
      continue: true,
      cancel: true,
      btn: [
        { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
        { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        const requestTarget = {
          functionName: 'removeRoutingPrice',
          method: 'POST',
          params: {
            userName: this.userName,
            routingPriceDTO: {
              id: item.id,
            },
          },
        };
        this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_NORM_MOVES_SUCCESS'));
            this.eSearch();
          } else {
            this.toastService.error(res.description);
          }
        });
      },
      (reason) => {},
    );
  }
  eSave(item, isUpdate) {
    const modalRef = this.modalService.open(AddEditTabDinhMucDiChuyenComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });

    if (isUpdate) {
      modalRef.componentInstance.isUpdate = true;
      modalRef.componentInstance.id = item.id;
      modalRef.componentInstance.tinhDi = item.fromProvinceId;
      modalRef.componentInstance.tinhDen = item.toProvinceId;
      modalRef.componentInstance.phuongTien = item.vehicleType;
      modalRef.componentInstance.chiPhi = formatNumber(+item.price, 'en-US', '1.0');
      modalRef.componentInstance.ghiChu = item.note;
    } else {
      modalRef.componentInstance.isUpdate = false;
    }

    modalRef.result.then((result) => {
      this.eSearch();
    });
  }
  eSearch() {
    this.isLoading$ = true;
    const request = this.conditionSearch().subscribe((res) => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.quanLyPhieuCongTacService.listDinhMucDiChuyen.next(res.data);
        this.dataSource = new MatTableDataSource<RoutingPriceDTO>(this.quanLyPhieuCongTacService.listDinhMucDiChuyen.value);
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
      functionName: 'searchRoutingPrice',
      method: 'POST',
      params: {
        userName: this.userName,
        routingPriceDTO: {
          fromProvinceId: this.control('tinhDi').value,
          toProvinceId: this.control('tinhDen').value,
          vehicleType: this.control('phuongTien').value,
        },
      },
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  eResetForm() {
    this.searchForm.reset();
    this.control('tinhDi').setValue('');
    this.control('tinhDen').setValue('');
    this.control('phuongTien').setValue('');
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

    return isValid;
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  control(controlName: string) {
    return this.searchForm.controls[controlName];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
