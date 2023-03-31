import { HotelDTO } from './../../../../_models/quan-ly-phieu-cong-tac.model';
import { OnDestroy, AfterViewInit } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, Inject, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, ValidationErrors, Validators, AbstractControl, FormControl } from '@angular/forms';
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
import { RequestApiModel } from 'src/app/pages/_models/request-api.model';
import { CommonService } from 'src/app/pages/_services/common.service';
import { QuanLyPhieuCongTacService } from 'src/app/pages/_services/quanLyPhieuCongTac.service';
import { CONFIG } from 'src/app/utils/constants';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-tab-khach-san-nha-nghi',
  templateUrl: './tab-khach-san-nha-nghi.component.html',
  styleUrls: ['./tab-khach-san-nha-nghi.component.scss'],
})
export class TabKhachSanNhaNghiComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() reloadDataEvent = new EventEmitter<any>();
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  addForm: FormGroup;
  private subscriptions: Subscription[] = [];

  @ViewChild('formSearch') formSearch: ElementRef;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
  startDateErrorMsg = '';
  endDateErrorMsg = '';
  isLoading$ = false;
  userRes: any;
  userName: any;
  staffId: number;
  isAdmin: any;

    columnsToDisplay = [
        'index',
        'provinceName',
        'hotelName',
        'roomTypeName',
        'numberOfRoom',
        'numberOfDay',
        'price',
        'totalAmount',
        'note',
        'hanhDong'
    ];
    isResetForm: boolean = false;

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
    this.staffId = this.userRes.staffId;
    this.isAdmin = this.userRes.isAdmin;
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.initDataBox();
    this.loadAddForm();

    const dataEvent = this.quanLyPhieuCongTacService.reloadDetailDataEvent.subscribe((event) => {
      this.dataSource = new MatTableDataSource(this.quanLyPhieuCongTacService.cbxKhachSanCongTac.value);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    this.subscriptions.push(dataEvent);

    const hotelEvent = this.quanLyPhieuCongTacService.changeHotelEvent.subscribe((khachSanId) => {
      //ROOM TYPE
      let requestRoomType = {
        functionName: 'getCbRoomTypeByHotel',
        method: 'POST',
        params: {
          userName: this.userName,
          hotelDTO: {
            hotelId: khachSanId,
          },
        },
      };
      this.quanLyPhieuCongTacService.getListRoomTypeBox(requestRoomType, true);
    });
    this.subscriptions.push(hotelEvent);
  }

  ngAfterViewInit() {
    this.control('khachSan')
      .valueChanges.pipe(debounceTime(800))
      .subscribe((event) => {
        if (typeof event == 'string') {
          this.filter(event);
        } else {
          this.filter(null);
        }
      });
  }

  filter(name: string) {
    //HOTEL
    let requestHotel = {
      functionName: 'searchHotel',
      method: 'POST',
      params: {
        userName: this.userName,
        hotelDTO: {
          provinceId: this.quanLyPhieuCongTacService.selectedLoTrinhCongTac.endProvinceId,
        },
        autoCompleteValue: name ? name : '',
      },
    };
    this.quanLyPhieuCongTacService.getListHotelBox(requestHotel, false);

    if (!name) {
      this.changeHotel();
    }
  }

  displayFn(hotel?: HotelDTO): string | undefined {
    return hotel ? hotel.hotelName : undefined;
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

  initDataBox() {
    this.quanLyPhieuCongTacService.cbxLoaiPhong.value.unshift({
      value: '',
      name: this.translate.instant('DEFAULT_OPTION.SELECT'),
    });
  }

  loadAddForm() {
    this.addForm = this.fb.group({
      khachSan: [
        {
          hotelId: '',
          hotelName: '',
        },
        [Validators.required],
      ],
      loaiPhong: ['', [Validators.required]],
      ghiChu: [''],
      soPhongThue: ['', [Validators.required, Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/)]],
      soNgayThue: ['', [Validators.required, Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/)]],
    });
  }

  changeHotel() {
    if (typeof this.control('khachSan').value == 'object' && this.control('khachSan').value.hotelId != '')
      this.quanLyPhieuCongTacService.changeHotel(this.control('khachSan').value.hotelId);
  }

  eSave() {
    if (!this.isValidForm()) {
      this.addForm.markAllAsTouched();
      return;
    }
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.ADD_HOTEL'),
      continue: true,
      cancel: true,
      btn: [
        { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
        { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        // add
        const requestTarget = {
          functionName: 'addJobHotel',
          method: 'POST',
          params: {
            userName: this.userName,
            jobHotelDTO: {
              jobRoutingId: this.quanLyPhieuCongTacService.selectedLoTrinhCongTac.id,
              hotelId:
                this.control('khachSan').value == '' || this.control('khachSan').value.hotelId == '' ? null : +this.control('khachSan').value.hotelId,
              roomType: this.control('loaiPhong').value,
              numberOfDay: this.control('soNgayThue').value.replace(/,/g, ''),
              numberOfRoom: this.control('soPhongThue').value.replace(/,/g, ''),
              note: this.control('ghiChu').value,
            },
          },
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.ADD_HOTEL_SUCCESS'));
            this.reloadDataEvent.emit();
            // clear form
            this.eResetForm();
          } else {
            this.toastService.error(res.description);
          }
        });
        this.subscriptions.push(rq);
      },
      (reason) => {},
    );
  }

  eDelete(item) {
    if (!this.isEnabledEdit()) return;

    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.DELETE_HOTEL'),
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
          functionName: 'removeJobHotel',
          method: 'POST',
          params: {
            userName: this.userName,
            jobHotelDTO: {
              id: item.id,
            },
          },
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe((res) => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_HOTEL_SUCCESS'));
            this.reloadDataEvent.emit();
          } else {
            this.toastService.error(res.description);
          }
        });
        this.subscriptions.push(rq);
      },
      (reason) => {},
    );
  }

  eResetForm() {
    this.isResetForm = true;
    this.addForm.reset();
    this.control('khachSan').setValue({
      hotelId: '',
      hotelName: '',
    });
    this.control('loaiPhong').setValue('');
    this.control('ghiChu').setValue('');
    this.control('soPhongThue').setValue('');
    this.control('soNgayThue').setValue('');
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.addForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.addForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isControlAutoCompleteInvalid(controlName: string, valueColumnName: string, isRequired: boolean): boolean {
    const control = this.addForm.controls[controlName];
    if (typeof control.value == 'string') {
      if (control.value != '' || isRequired) control.setErrors({ noSelect: true });
    } else {
      const valueColumn = control.value[valueColumnName];
      if (valueColumn == '' && isRequired) {
        control.setErrors({ required: true });
      }
    }
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.addForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.addForm.controls[controlName];
    return control.dirty || control.touched;
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addForm.get(key).errors;

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

  control(controlName: string): AbstractControl {
    return this.addForm.controls[controlName];
  }

  castFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  isEnabledEdit() {
    let validStatus = false;
    let validStatusVO = false;
    switch (this.quanLyPhieuCongTacService.selectedPhieuCongTac.status) {
      case 1:
      case 3:
        validStatus = true;
        break;
    }
    switch (this.quanLyPhieuCongTacService.selectedPhieuCongTac.signVofficeStatus) {
      case null:
      case 2:
        validStatusVO = true;
        break;
    }
    return validStatus && validStatusVO;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
