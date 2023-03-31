import { debounceTime } from 'rxjs/operators';
import { OnDestroy, AfterViewInit } from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {Component, ElementRef, EventEmitter, Inject, Injector, OnInit, Output, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, ValidationErrors, Validators, AbstractControl, FormControl } from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Subscription, BehaviorSubject} from 'rxjs';
import {CommonAlertDialogComponent} from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { RequestApiModel } from 'src/app/pages/_models/request-api.model';
import {CommonService} from 'src/app/pages/_services/common.service';
import {QuanLyPhieuCongTacService} from 'src/app/pages/_services/quanLyPhieuCongTac.service';
import {CONFIG} from 'src/app/utils/constants';
import { StaffDTO } from 'src/app/pages/_models/quan-ly-phieu-cong-tac.model';

@Component({
    selector: 'app-tab-can-bo-nhan-vien',
    templateUrl: './tab-can-bo-nhan-vien.component.html',
    styleUrls: ['./tab-can-bo-nhan-vien.component.scss']
})
export class TabCanBoNhanVienComponent implements OnInit, OnDestroy, AfterViewInit {
    @Output() reloadDataEvent = new EventEmitter<any>();
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    addForm: FormGroup;
    private subscriptions: Subscription[] = [];

    @ViewChild('formSearch') formSearch: ElementRef;
    isShowUpdate = new BehaviorSubject<boolean>(false);
    isShowOffStation = new BehaviorSubject<boolean>(false);
    startDateErrorMsg: string = '';
    endDateErrorMsg: string = '';
    isLoading$: boolean = false;
    userRes: any;
    userName: any;
    staffId: number;
    isAdmin: any;

    columnsToDisplay = [
        'index',
        'shopName',
        'staffCode',
        'staffName',
        'positionName',
        'titleName',
        'price',
        'numberDayBusiness',
        'totalAmount',
        'soDienThoai',
        'email',
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
        @Inject(Injector) private readonly injector: Injector
    ) {
    }

    ngOnInit(): void {
        this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
        this.staffId = this.userRes.staffId;
        this.isAdmin = this.userRes.isAdmin;
        this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
        this.initDataBox();
        this.loadAddForm();

        const dataEvent = this.quanLyPhieuCongTacService.reloadDetailDataEvent.subscribe(event => {
            this.dataSource = new MatTableDataSource(this.quanLyPhieuCongTacService.cbxNhanVienCongTac.value);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
        this.subscriptions.push(dataEvent);
    }

    ngAfterViewInit() {
        this.control('maNhanVien').valueChanges.pipe(debounceTime(800)).subscribe(event => {
            if(!this.isResetForm) {
                if (typeof event == 'string') {
                    this.filter(event);
                } else {
                    this.filter('');
                }
            }
            this.isResetForm = false;
        });
    }

    filter(name: string) {
        const requestStaff = {
            functionName: 'getCbStaff',
            method: 'POST',
            params: {
                userName: this.userName,
                staffType: '1',
                autoCompleteValue: name
            }
        };
        const sb = this.quanLyPhieuCongTacService.getListStaffBox(requestStaff, false).subscribe();
        this.subscriptions.push(sb);
    }

    displayFn(user?: StaffDTO): string | undefined {
        return user ? user.staffName : undefined;
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
        //STAFF NOI BO
        let requestStaff = {
            functionName: "getCbStaff",
            method: "POST",
            params: {
                userName: this.userName,
                staffType: "1",
                autoCompleteValue: "",
            },
        };
        const rqStaff = this.quanLyPhieuCongTacService.getListStaffBox(requestStaff, false).subscribe();
        this.subscriptions.push(rqStaff);
    }

    loadAddForm() {
        this.addForm = this.fb.group({
            maNhanVien: [{
                staffId: '',
                staffName: '',
            }, [Validators.required]],
            ghiChu: ['']
        });
    }

    eSave() {
        if (!this.isValidForm()) {
            this.addForm.markAllAsTouched();
            return;
        }

        const modalRef = this.modalService.open(CommonAlertDialogComponent, {
            centered: true,
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            type: 'WARNING',
            title: 'COMMON_MODAL.WARNING',
            message: this.translate.instant('CONFIRM.ADD_STAFF'),
            continue: true,
            cancel: true,
            btn: [
                {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
                {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
            ]
        };
        modalRef.result.then(
            result => {
                // add
                const requestTarget = {
                    functionName: 'addJobStaff',
                    method: 'POST',
                    params: {
                        userName: this.userName,
                        jobStaffDTO: {
                            jobRoutingId: this.quanLyPhieuCongTacService.selectedLoTrinhCongTac.id,
                            staffId: this.control('maNhanVien').value == "" || this.control('maNhanVien').value.staffId == "" ? null : +this.control('maNhanVien').value.staffId,
                            note: this.control('ghiChu').value
                        }
                    }
                };
                this.isLoading$ = true;
                const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                    this.isLoading$ = false;
                    if (res.errorCode == '0') {
                    this.toastService.success(this.translate.instant('MESSAGE.ADD_STAFF_SUCCESS'));
                    this.reloadDataEvent.emit();
                    // clear form
                    this.eResetForm();
                    } else {
                    this.toastService.error(res.description);
                    }
                });
                this.subscriptions.push(rq);
            },
            reason => {
            }
        );
    }

    eDelete(item) {
        if (!this.isEnabledEdit()) return;
        
        const modalRef = this.modalService.open(CommonAlertDialogComponent, {
            centered: true,
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            type: 'WARNING',
            title: 'COMMON_MODAL.WARNING',
            message: this.translate.instant('CONFIRM.DELETE_STAFF'),
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
                    functionName: 'removeJobStaff',
                    method: 'POST',
                    params: {
                      userName: this.userName,
                      jobStaffDTO: {
                        id: item.id
                      }
                    }
                  };
                  this.isLoading$ = true;
                  const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                    this.isLoading$ = false;
                    if (res.errorCode == '0') {
                      this.toastService.success(this.translate.instant('MESSAGE.DELETE_STAFF_SUCCESS'));
                      this.reloadDataEvent.emit();
                    } else {
                      this.toastService.error(res.description);
                    }
                });
                this.subscriptions.push(rq);
            },
            reason => {
            }
        );
    }

    eResetForm() {
        this.isResetForm = true;
        this.addForm.reset();
        this.control('maNhanVien').setValue({
            staffId: '',
            staffName: '',
        });
        this.control('ghiChu').setValue('');
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
            if (control.value != '' || isRequired) control.setErrors({'noSelect': true});
        } else {
          const valueColumn = control.value[valueColumnName];
          if (valueColumn == '' && isRequired) {
              control.setErrors({'required': true});
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
            const controlErrors: ValidationErrors =
                this.addForm.get(key).errors;

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

    control(controlName: string) : AbstractControl{
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
