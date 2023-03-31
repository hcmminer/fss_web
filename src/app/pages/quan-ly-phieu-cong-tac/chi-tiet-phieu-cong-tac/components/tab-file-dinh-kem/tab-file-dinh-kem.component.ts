import { OnDestroy } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, Inject, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
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

const MAX_FILE_SIZE_TEMPLATE = (1024 * 1024 * 10);

@Component({
  selector: 'app-tab-file-dinh-kem',
  templateUrl: './tab-file-dinh-kem.component.html',
  styleUrls: ['./tab-file-dinh-kem.component.scss']
})
export class TabFileDinhKemComponent implements OnInit, OnDestroy {
  @Output() reloadDataEvent = new EventEmitter<any>();
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  addForm: FormGroup;
  private subscriptions: Subscription[] = [];

  @ViewChild('formSearch') formSearch: ElementRef;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
  isLoading$: boolean = false;
  userRes: any;
  userName: any;
  staffId: number;
  isAdmin: any;
  isViewingDetail: boolean = false;
  selectedPhieuCongTac: any;
  selectedFile: any = null;


  columnsToDisplay = [
    'index',
    'typeName',
    'fileName',
    'note',
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
    this.staffId = this.userRes.staffId;
    this.isAdmin = this.userRes.isAdmin;
    this.initDataBox();
    this.loadAddForm();

    const dataEvent = this.quanLyPhieuCongTacService.reloadDetailDataEvent.subscribe(event => {
      this.dataSource = new MatTableDataSource(this.quanLyPhieuCongTacService.cbxFileDinhKemCongTac.value);
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

  onFileSelected(event: any): void {
    this.validateFile(event);
    this.selectedFile = event.target.files[0] ?? null;
  }

  validateFile(event: any) {
    let file = event.target.files[0];

    //check định dạng
    let allowedType: string[] = ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt', 'svg', 'png', 'jpg', 'jpeg'];
    let fileExtension: string = file.name.substring(file.name.lastIndexOf('.') + 1);
    if (!allowedType.includes(fileExtension)) {
      this.toastService.error(this.translate.instant('VALIDATION.FILE_INVALID_EXTENSION', {0: '.doc, .docx, .xls, .xlsx, .pdf, .txt, .svg, .png, .jpg, .jpeg'}));
      return;
    }
    //check dung luong
    if (file.size > MAX_FILE_SIZE_TEMPLATE) {
      this.toastService.error(this.translate.instant('VALIDATION.FILE_MAX_SIZE', {0: 10}));
      return;
    }
    // // check up trung file
    // if(file){
    //   file.name === null ? this.flag = true : this.flag = false;
    // }

    // this.fileNameTemplate = file.name;
    // this.file = file;
  }

  initDataBox() {
  }

  loadAddForm() {
    this.addForm = this.fb.group({
      loaiFile: ['', [Validators.required]],
      chonFile: ['', [Validators.required]],
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
      message: this.translate.instant('CONFIRM.ADD_FILE'),
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
        const formData: FormData = new FormData();
        formData.append('fileCreateRequest', this.selectedFile);
        const requestTarget = {
          functionName: 'addJobAttach',
          method: 'POST',
          params: {
            userName: this.userName,
            jobRoutingId: this.quanLyPhieuCongTacService.selectedLoTrinhCongTac.id,
            type: this.control('loaiFile').value,
            note: this.control('ghiChu').value,
            isFinish: 0
          },
          formData: formData
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.ADD_FILE_SUCCESS'));
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

  eDownloadFile(item) {
    const requestTarget = {
      functionName: 'getFile',
      method: 'POST',
      params: {
        userName: this.userName,
        jobAttachDTO: {
          id: item.id
        }
      },
      responseType: "blob",
      observe: "response"
    };
    this.isLoading$ = true;
    const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      this.quanLyPhieuCongTacService.saveFile(item.fileName, item.mimeType, res);
    });
    this.subscriptions.push(rq);
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
      message: this.translate.instant('CONFIRM.DELETE_FILE_ATTACH'),
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
          functionName: 'removeJobAttach',
          method: 'POST',
          params: {
            userName: this.userName,
            jobAttachDTO: {
              id: item.id
            }
          }
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_FILE_SUCCESS'));
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
    this.addForm.reset();
    this.control('loaiFile').setValue('');
    this.control('chonFile').setValue('');
    this.control('ghiChu').setValue('');
    this.selectedFile = null;
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

    return isValid;
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  control(controlName: string): AbstractControl{
    return this.addForm.controls[controlName];
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
