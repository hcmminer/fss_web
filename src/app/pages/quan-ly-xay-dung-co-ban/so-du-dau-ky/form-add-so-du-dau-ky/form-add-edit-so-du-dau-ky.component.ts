import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { CONFIG } from 'src/app/utils/constants';
import { RequestApiModelOld } from 'src/app/pages/_models/requestOld-api.model';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';

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
  selector: 'app-form-add-so-du-dau-ky',
  templateUrl: './form-add-so-du-dau-ky.component.html',
  styleUrls: ['./form-add-so-du-dau-ky.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FormAddEditSoDuDauKyComponent implements OnInit {
  typeForm;
  item;
  @Output() closeContent = new EventEmitter<any>();
  @ViewChild('popupMessage') popupMessage: ElementRef;
  constructionDateErrorMsg = '';
  valueChange: boolean = false;
  userName: any;
  addEditForm: FormGroup;
  private subscriptions: Subscription[] = [];
  constructor(
    public fb: FormBuilder,
    private globalService: GlobalService,
    public modalService: NgbModal,
    public translate: TranslateService,
    public toastrService: ToastrService,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.loadFormAdd();
    console.log(this.item);
    console.log(this.typeForm);
  }


  loadFormAdd() {
    this.addEditForm = this.fb.group({
      organisation: ['', [Validators.required]],
      assetCode: ['', [Validators.required]],
      contract: ['', [Validators.required]],
      constructionDateStr: ['', [Validators.required]],
      material: ['', [Validators.required]],
      labor: ['', [Validators.required]],
    });
  }

  
  loadFormEdit() {
    this.addEditForm = this.fb.group({
      organisation: ['', [Validators.required]],
      assetCode: ['', [Validators.required]],
      contract: ['', [Validators.required]],
      constructionDateStr: ['', [Validators.required]],
      material: ['', [Validators.required]],
      labor: ['', [Validators.required]],
    });
  }

  //check input date
  eInputDate(event: any) {
    let value = event.target.value;
    if (typeof value == 'string' && value == '') {
      this.constructionDateErrorMsg = this.translate.instant('VALIDATION.REQUIRED', { name: this.translate.instant('LABEL.CONSTRUCTION_DATE') });
    }
  }

  handleClose() {
    this.closeContent.emit(true);
  }

  closeDialog() {
    this.activeModal.close();
  }

  openModal(_content) {
    this.modalService.open(_content, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      centered: true
    });
  }
  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addEditForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.addEditForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });
    
    if (this.constructionDateErrorMsg !== '') {
      isValid = false;
    }
    return isValid;
  }

  conditionAddEdit() {
    const requestTarget = {
      userName: this.userName,
      constructionDTO:{ 
          assetCode: this.addEditForm.get('assetCode').value,
          organisation: this.addEditForm.get('organisation').value,
          contract: this.addEditForm.get('contract').value,
          constructionDateStr: this.transform(this.addEditForm.get('constructionDateStr').value),
          material: this.addEditForm.get('material').value,
          labor: this.addEditForm.get('labor').value,
      }
    };
    return this.globalService.globalApi(requestTarget as RequestApiModelOld, 'add-bc-opening-single');
  }

  //thay đổi format date
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }

  //add hoặc edit 
  save() {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.ADD_OPEN_BALANCE'),
      continue: true,
      cancel: true,
      btn: [
        { text: this.translate.instant('CANCEL'), className: 'btn-outline-warning btn uppercase mx-2' },
        { text: this.translate.instant('CONTINUE'), className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        let request = this.conditionAddEdit().subscribe(res => {
          if (res.errorCode === '0') {
            this.toastrService.success(this.translate.instant('TRANS.STATUS_REFUSE'));
            this.activeModal.close();
            this.handleClose();
          } else {
            this.toastrService.error(res.description);
            this.handleClose();
          }
        });
        this.subscriptions.push(request)
      },
      (reason) => { },
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
