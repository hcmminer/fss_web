import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, Inject, Injector, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import {FormGroup, FormBuilder, ValidationErrors, Validators, AbstractControl} from '@angular/forms';
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

@Component({
    selector: 'app-tab-can-bo-nhan-vien',
    templateUrl: './tab-can-bo-nhan-vien.component.html',
    styleUrls: ['./tab-can-bo-nhan-vien.component.scss']
})
export class TabCanBoNhanVienComponent implements OnInit, OnDestroy {
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
        'chucDanh',
        'doiTuong',
        'congTacPhiNgay',
        'soNgayCongTacPhi',
        'totalAmount',
        'soDienThoai',
        'email',
        'note'
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
        // this.quanLyPhieuCongTacService.getListProvinceBox({functionName: 'getListProvince'}, this.isAdmin ? true : false);
    }

    loadAddForm() {
        this.addForm = this.fb.group({
            maNhanVien: ['', [Validators.required]],
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
                            staffId: this.control('maNhanVien').value,
                            note: this.control('ghiChu').value
                        }
                    }
                };
                this.isLoading$ = true;
                const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                    this.isLoading$ = false;
                    if (res.errorCode == '0') {
                    this.toastService.success(this.translate.instant('MESSAGE.ADD_DATA_SUCCESS'));
                    this.reloadDataEvent.emit();
                    // clear form
                    this.eResetForm();
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

    eDelete(item) {
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
                const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                    this.isLoading$ = false;
                    if (res.errorCode == '0') {
                      this.toastService.success(this.translate.instant('MESSAGE.DELETE_DATA_SUCCESS'));
                      this.reloadDataEvent.emit();
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

    eResetForm() {
        this.addForm.reset();
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

    ngOnDestroy(): void {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
    }
}
