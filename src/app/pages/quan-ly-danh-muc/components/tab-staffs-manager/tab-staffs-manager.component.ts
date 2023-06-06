import { AddEditTabDinhMucDiChuyenComponent } from '../add-edit-tab-dinh-muc-di-chuyen/add-edit-tab-dinh-muc-di-chuyen.component';
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
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { CommonService } from 'src/app/pages/_services/common.service';
import { CONFIG } from 'src/app/utils/constants';
import { BusinessFeeDTO, RoutingPriceDTO, StaffDTO } from '../../../_models/quan-ly-phieu-cong-tac.model';
import { RequestApiModel } from '../../../_models/request-api.model';
import { DatePipe, formatNumber } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AddEditStaffsManagerComponent } from '../add-edit-tab-staffs-manager/add-edit-tab-staffs-manager.component';
import { CategoryManagerService } from 'src/app/pages/_services/category-manager.service';

@Component({
  selector: 'app-tab-staffs-manager',
  templateUrl: './tab-staffs-manager.component.html',
  styleUrls: ['./tab-staffs-manager.component.scss'],
})
export class TabStaffsManagerComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource<StaffDTO>();
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
  columnsToDisplay = [
    'index',
    'staffCategoryName',
    'staffCode',
    'staffName',
    'shopName',
    'mobile',
    'email',
    'gender',
    'hanhDong',
  ];

  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public categoryManagerService: CategoryManagerService,
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
    this.init();
  }

  init() {
    let userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    let requestShopname = {
      functionName: 'getCbShop',
      method: 'POST',
      params: {
        userName: this.userName,
      },
      formData: {
        userName: userName,
        shopType: '1',
        autoCompleteValue: '',
      },
    };
    let requestListPosition = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'POSITION',
        },
      },
    };
    let requestListStaffType = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'STAFF_TYPE',
        },
      },
    };
    let requestListGender = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'GENDER',
        },
      },
    };
    let requestgetListTitle = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'TITLE',
        },
      },
    };

    let requestgetListStaffCategory = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'KPI_USER_TYPE',
        },
      },
    };
    this.categoryManagerService.getListShopnameBox(requestShopname, true);
    this.categoryManagerService.getListPosition(requestListPosition, true);
    this.categoryManagerService.getListStaffType(requestListStaffType, true);
    this.categoryManagerService.getListGender(requestListGender, true);
    this.categoryManagerService.getListTitle(requestgetListTitle, true);
    this.categoryManagerService.getListStaffCategory(requestgetListStaffCategory, true);
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

  applyFilter(event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    if (event.target.value == '') {
      this.eSearch();
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
    this.categoryManagerService.getListVehicleBox(requestVehicle, true);
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
      message: this.translate.instant('CONFIRM.DELETE_STAFF'),
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
          functionName: 'removeStaff',
          method: 'POST',
          params: {
            userName: this.userName,
            staffDTO: {
              staffId: item.staffId,
            },
          },
        };
        this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_STAFF_SUCCESS'));
            this.eSearch();
          } else {
            this.toastService.error(res.description);
          }
        });
      },
      (reason) => {},
    );
  }

  // helpers for View
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }

  // add new staff
  eSave(item: any, isUpdate: boolean) {
    const modalRef = this.modalService.open(AddEditStaffsManagerComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });

    if (isUpdate) {
      modalRef.componentInstance.isUpdate = true;
      // required
      modalRef.componentInstance.staffId = item.staffId;
      modalRef.componentInstance.staffName = item.staffName;
      modalRef.componentInstance.gender = item.gender;
      modalRef.componentInstance.staffType = item.staffType;
      modalRef.componentInstance.shopId = item.shopId;
      modalRef.componentInstance.position = item.position;
      modalRef.componentInstance.staffCodeNumber = item.staffCodeNumber;
      modalRef.componentInstance.title = item.title;
      modalRef.componentInstance.staffCategory = item.staffCategory;
      // No required
      modalRef.componentInstance.staffCode = item.staffCode;
      modalRef.componentInstance.provinceId = item.provinceId;
      modalRef.componentInstance.mobile = item.mobile;
      modalRef.componentInstance.email = item.email;
    } else {
      modalRef.componentInstance.isUpdate = false;
    }

    modalRef.result.then((result) => {
      // sau khi sua 1 nhan vien bat ky phai render lai list nhan vien
      this.eSearch();
    });
  }
  eSearch() {
    this.isLoading$ = true;
    const request = this.conditionSearch().subscribe((res) => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        // cap nhat lai liststaff cho render lai
        console.log(res.data[5].shopName);
        this.categoryManagerService.listStaffs.next(res.data);
        this.dataSource = new MatTableDataSource<StaffDTO>(this.categoryManagerService.listStaffs.value);
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
      functionName: 'searchStaff',
      method: 'POST',
      params: {
        userName: this.userName,
        staffDTO: {},
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
