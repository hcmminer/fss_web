import { OnDestroy } from '@angular/core';
import {Component, EventEmitter, Inject, Injector, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {QuanLyPhieuCongTacService} from "../../../_services/quanLyPhieuCongTac.service";
import {CommonService} from "../../../_services/common.service";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {CommonAlertDialogComponent} from "../../../common/common-alert-dialog/common-alert-dialog.component";
import {RequestApiModel} from "../../../_models/request-api.model";
import {CONFIG} from "../../../../utils/constants";
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-add-edit-tab-quan-ly-cong-tac-phi',
    templateUrl: './add-edit-tab-quan-ly-cong-tac-phi.component.html',
    styleUrls: ['./add-edit-tab-quan-ly-cong-tac-phi.component.scss']
})
export class AddEditTabQuanLyCongTacPhiComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];
    @Output() reloadDataEvent = new EventEmitter<any>();
    addForm: FormGroup;
    isLoading$ = false;
    userRes: any;
    userName: any;
    isUpdate: boolean = false;

    id;
    chucDanh = '';
    chiPhi = null;
    ghiChu = '';

    constructor(
        public router: Router,
        public translate: TranslateService,
        private fb: FormBuilder,
        private modalService: NgbModal,
        public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
        public commonService: CommonService,
        public toastrService: ToastrService,
        public spinner: NgxSpinnerService,
        private activeModal: NgbActiveModal,
        @Inject(Injector) private readonly injector: Injector
    ) {
    }

    ngOnInit() {
        this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
        this.loadAddForm();
    }

    loadAddForm() {
        this.addForm = this.fb.group({
            chucDanh: [this.chucDanh, [Validators.required]],
            chiPhi: [this.chiPhi, [Validators.required,  Validators.pattern(/(^\d*[1-9]\d*$)|(^(?!0+\.00)(?=.{1,15}(\.|$))(?!0(?!\.))\d{1,3}(,\d{3})*$)/)]],
            ghiChu: [this.ghiChu]
        });
    }

    eCloseWithoutEdit() {
        this.activeModal.dismiss();
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
            message: this.isUpdate ? (this.translate.instant('CONFIRM.UPDATE_NORM_BUSINESS_FEE'))
                : (this.translate.instant('CONFIRM.ADD_NORM_BUSINESS_FEE')),
            continue: true,
            cancel: true,
            btn: [
                {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
                {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
            ]
        };
        modalRef.result.then(
            result => {
                if(this.isUpdate) {
                    const requestTarget = {
                        functionName: 'editBusinessFee',
                        method: 'POST',
                        params: {
                            userName: this.userName,
                            businessFeeDTO: {
                                id: this.id,
                                title: this.addForm.get('chucDanh').value,
                                amount: this.addForm.get('chiPhi').value.replace(/,/g, ''),
                                note: this.addForm.get('ghiChu').value
                            }
                        }
                    };
                    const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                        if (res.errorCode == '0') {
                            this.toastService.success(this.translate.instant('MESSAGE.UPDATE_BUSINESS_FEE_SUCCESS'));
                            this.activeModal.close();
                        } else {
                            this.toastService.error(res.description);
                        }
                    });
                    this.subscriptions.push(request);
                } else {
                    const requestTarget = {
                        functionName: 'addBusinessFee',
                        method: 'POST',
                        params: {
                            userName: this.userName,
                            businessFeeDTO: {
                                title: this.addForm.get('chucDanh').value,
                                amount: this.addForm.get('chiPhi').value,
                                note: this.addForm.get('ghiChu').value
                            }
                        }
                    };
                    const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                        if (res.errorCode == '0') {
                            this.toastService.success(this.translate.instant('MESSAGE.ADD_BUSINESS_FEE_SUCCESS'));
                            this.activeModal.close();
                        } else {
                            this.toastService.error(res.description);
                        }
                    });
                    this.subscriptions.push(request);
                }
            },
            reason => {

            }
        );
    }
    eResetForm() {
        this.addForm.reset();
    }

    isValidForm(): boolean {
        let isValid = true;
        Object.keys(this.addForm.controls).forEach((key) => {
            const controlErrors: ValidationErrors = this.addForm.get(key).errors;

            if (controlErrors) {
                isValid = false;
            }
        });

        return isValid;
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

    public get toastService() {
        return this.injector.get(ToastrService);
    }

    control(controlName: string): AbstractControl {
        return this.addForm.controls[controlName];
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
    }
}
