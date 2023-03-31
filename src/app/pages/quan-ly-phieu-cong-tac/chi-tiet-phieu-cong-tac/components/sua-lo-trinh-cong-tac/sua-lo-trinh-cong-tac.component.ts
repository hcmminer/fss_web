import { OnDestroy, AfterViewInit } from "@angular/core";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, Inject, Injector, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NgbActiveModal, NgbDate, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, forkJoin, Subscription } from "rxjs";
import { CommonAlertDialogComponent } from "src/app/pages/common/common-alert-dialog/common-alert-dialog.component";
import { RequestApiModel } from "src/app/pages/_models/request-api.model";
import { CommonService } from "src/app/pages/_services/common.service";
import { QuanLyPhieuCongTacService } from "src/app/pages/_services/quanLyPhieuCongTac.service";
import { CONFIG } from "src/app/utils/constants";
import { getDateInputWithFormat } from "src/app/utils/functions";
import {
  ShopDTO,
  StaffDTO,
} from "src/app/pages/_models/quan-ly-phieu-cong-tac.model";
import { debounceTime } from "rxjs/operators";

const defaultShop = {
  shopId: "",
  shopName: "",
};

const defaultStaff = {
  staffId: "",
  staffName: "",
};

@Component({
  selector: "app-sua-lo-trinh-cong-tac",
  templateUrl: "./sua-lo-trinh-cong-tac.component.html",
  styleUrls: ["./sua-lo-trinh-cong-tac.component.scss"],
})
export class SuaLoTrinhCongTacComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  id;
  jobRequestId;
  code;
  queryLoTrinh = {
    tenLoTrinh: "",
    startDateLoTrinh: "",
    iValidStartDateLoTrinh: new NgbDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    ),
    endDateLoTrinh: "",
    iValidEndDateLoTrinh: new NgbDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    ),
    tinhDi: "",
    tinhDen: "",
    donViDi: null,
    // donViDiShopId: null,
    donViDen: null,
    // donViDenShopId: null,
    dauMoiNhanSu: null,
    // dauMoiNhanSuStaffId: null,
    doiTac: "",
    // ghiChu: ''
  };

  private subscriptions: Subscription[] = [];
  loTrinhForm: FormGroup;
  startDateLoTrinhErrorMsg: string = "";
  endDateLoTrinhErrorMsg: string = "";
  isLoading$: boolean = false;
  userRes: any;
  userName: string;

  donViDiList = new BehaviorSubject<ShopDTO[]>([
    {
      shopId: "",
      shopName: "",
    },
  ]);
  donViDenList = new BehaviorSubject<ShopDTO[]>([
    {
      shopId: "",
      shopName: "",
    },
  ]);
  dauMoiNhanVienList = new BehaviorSubject<StaffDTO[]>([
    {
      staffId: "",
      staffName: "",
    },
  ]);

  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    public activeModal: NgbActiveModal,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  ngOnInit() {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.initDataBox();
    this.loadLoTrinhForm();
  }

  initDataBox() {
    //SHOP NOI BO DI
    let requestShop = {
      functionName: "getCbShop",
      method: "POST",
      params: {
        userName: this.userName,
        shopType: "1",
        autoCompleteValue: "",
        provinceId: +this.queryLoTrinh.tinhDi,
        shopState: "from",
      },
    };
    const rqShop = this.quanLyPhieuCongTacService.getListShopBox(
      requestShop,
      false
    );

    //SHOP NOI BO DEN
    let requestShopDen = {
      functionName: "getCbShop",
      method: "POST",
      params: {
        userName: this.userName,
        shopType: "1",
        autoCompleteValue: "",
        provinceId: +this.queryLoTrinh.tinhDen,
        shopState: "to",
      },
    };
    const rqShopDen = this.quanLyPhieuCongTacService.getListShopBox(
      requestShopDen,
      false
    );

    //STAFF NOI BO
    let requestStaff = {
      functionName: "getCbStaff",
      method: "POST",
      params: {
        userName: this.userName,
        staffType: "1",
        autoCompleteValue: "",
        provinceId: +this.queryLoTrinh.tinhDen,
      },
    };
    const rqStaff = this.quanLyPhieuCongTacService.getListStaffBox(
      requestStaff,
      true
    );

    const initRqArr = forkJoin([rqShop, rqShopDen, rqStaff]).subscribe(
      (res) => {
        //Shop di
        this.donViDiList.next(
          this.quanLyPhieuCongTacService.cbxDonViNoiBoDi.value
        );
        const donViDiValue = this.donViDiList.value.find(
          (donVi) => donVi.shopId == this.queryLoTrinh.donViDi
        );
        if (donViDiValue) {
          this.queryLoTrinh.donViDi = {
            shopId: donViDiValue.shopId,
            shopName: donViDiValue.shopName,
          };
        } else {
          this.queryLoTrinh.donViDi = defaultShop;
        }

        //Shop den
        this.donViDenList.next(
          this.quanLyPhieuCongTacService.cbxDonViNoiBoDen.value
        );
        const donViDenValue = this.donViDenList.value.find(
          (donVi) => donVi.shopId == this.queryLoTrinh.donViDen
        );
        if (donViDenValue) {
          this.queryLoTrinh.donViDen = {
            shopId: donViDenValue.shopId,
            shopName: donViDenValue.shopName,
          };
        } else {
          this.queryLoTrinh.donViDen = defaultShop;
        }

        //Staff dau moi
        this.dauMoiNhanVienList.next(
          this.quanLyPhieuCongTacService.cbxNhanVienNoiBo.value
        );
        const dauMoiNhanSuValue = this.dauMoiNhanVienList.value.find(
          (nhanVien) => nhanVien.staffId == this.queryLoTrinh.dauMoiNhanSu
        );
        if (dauMoiNhanSuValue) {
          this.queryLoTrinh.dauMoiNhanSu = {
            staffId: dauMoiNhanSuValue.staffId,
            staffName: dauMoiNhanSuValue.staffName,
          };
        } else {
          this.queryLoTrinh.dauMoiNhanSu = defaultStaff;
        }

        this.loadLoTrinhForm();
      }
    );

    this.subscriptions.push(initRqArr);
  }

  loadLoTrinhForm() {
    let startDateLoTrinh = this.queryLoTrinh.startDateLoTrinh.replace(
      /\//g,
      ""
    );
    let endDateLoTrinh = this.queryLoTrinh.endDateLoTrinh.replace(/\//g, "");
    this.queryLoTrinh.iValidStartDateLoTrinh = new NgbDate(
      parseInt(startDateLoTrinh.substr(4, 4)),
      parseInt(startDateLoTrinh.substr(2, 2)),
      parseInt(startDateLoTrinh.substr(0, 2))
    );
    this.queryLoTrinh.iValidEndDateLoTrinh = new NgbDate(
      parseInt(endDateLoTrinh.substr(4, 4)),
      parseInt(endDateLoTrinh.substr(2, 2)),
      parseInt(endDateLoTrinh.substr(0, 2))
    );
    this.loTrinhForm = this.fb.group({
      tenLoTrinh: [this.queryLoTrinh.tenLoTrinh, [Validators.required]],
      iValidStartDateLoTrinh: [
        this.queryLoTrinh.startDateLoTrinh,
        [Validators.required],
      ],
      iValidEndDateLoTrinh: [
        this.queryLoTrinh.endDateLoTrinh,
        [Validators.required],
      ],
      tinhDi: [this.queryLoTrinh.tinhDi, [Validators.required]],
      tinhDen: [this.queryLoTrinh.tinhDen, [Validators.required]],
      donViDi: [this.queryLoTrinh.donViDi, [Validators.required]],
      donViDen: [this.queryLoTrinh.donViDen, [Validators.required]],
      dauMoiNhanSu: [this.queryLoTrinh.dauMoiNhanSu],
      doiTac: [this.queryLoTrinh.doiTac],
      // ghiChu: [this.queryLoTrinh.ghiChu]
    });

    this.loTrinhControl("donViDi")
      .valueChanges.pipe(debounceTime(800))
      .subscribe((event) => {
        if (typeof event == "string") {
          this.filterShopDi(event);
        } else {
          this.filterShopDi("");
        }
      });
    this.loTrinhControl("donViDen")
      .valueChanges.pipe(debounceTime(800))
      .subscribe((event) => {
        if (typeof event == "string") {
          this.filterShopDen(event);
        } else {
          this.filterShopDen("");
        }
      });
    this.loTrinhControl("dauMoiNhanSu")
      .valueChanges.pipe(debounceTime(800))
      .subscribe((event) => {
        if (typeof event == "string") {
          this.filterStaff(event);
        } else {
          this.filterStaff("");
        }
      });
  }

  ngAfterViewInit(): void {}

  eChangeProvince(type) {
    if (type == "from") {
      this.loTrinhControl("donViDi").setValue(defaultShop);
      //SHOP NOI BO
      let requestShop = {
        functionName: "getCbShop",
        method: "POST",
        params: {
          userName: this.userName,
          shopType: "1",
          autoCompleteValue: "",
          provinceId: +this.queryLoTrinh.tinhDi,
          shopState: "from",
        },
      };
      const rqShop = this.quanLyPhieuCongTacService
        .getListShopBox(requestShop, false)
        .subscribe((res) => {
          this.donViDiList.next(
            this.quanLyPhieuCongTacService.cbxDonViNoiBoDi.value
          );
        });
      this.subscriptions.push(rqShop);
    } else if (type == "to") {
      this.loTrinhControl("donViDen").setValue(defaultShop);
      this.loTrinhControl("dauMoiNhanSu").setValue(defaultStaff);
      //STAFF NOI BO
      let requestStaff = {
        functionName: "getCbStaff",
        method: "POST",
        params: {
          userName: this.userName,
          staffType: "1",
          autoCompleteValue: "",
          provinceId: +this.queryLoTrinh.tinhDen,
        },
      };
      const rqStaff = this.quanLyPhieuCongTacService
        .getListStaffBox(requestStaff, true)
        .subscribe((res) => {
          this.dauMoiNhanVienList.next(
            this.quanLyPhieuCongTacService.cbxNhanVienNoiBo.value
          );
        });
      this.subscriptions.push(rqStaff);

      //SHOP NOI BO
      let requestShop = {
        functionName: "getCbShop",
        method: "POST",
        params: {
          userName: this.userName,
          shopType: "1",
          autoCompleteValue: "",
          provinceId: +this.queryLoTrinh.tinhDen,
          shopState: "to",
        },
      };
      const rqShop = this.quanLyPhieuCongTacService
        .getListShopBox(requestShop, false)
        .subscribe((res) => {
          this.donViDenList.next(
            this.quanLyPhieuCongTacService.cbxDonViNoiBoDen.value
          );
        });
      this.subscriptions.push(rqShop);
    }
  }

  filterShopDi(name: string) {
    const requestShop = {
      functionName: "getCbShop",
      method: "POST",
      params: {
        userName: this.userName,
        shopType: "1",
        autoCompleteValue: name,
        provinceId: +this.queryLoTrinh.tinhDi,
        shopState: "from",
      },
    };
    const sb = this.quanLyPhieuCongTacService
      .getListShopBox(requestShop, false)
      .subscribe((res) => {
        this.donViDiList.next(
          this.quanLyPhieuCongTacService.cbxDonViNoiBoDi.value
        );
      });
    this.subscriptions.push(sb);
  }

  filterShopDen(name: string) {
    const requestShop = {
      functionName: "getCbShop",
      method: "POST",
      params: {
        userName: this.userName,
        shopType: "1",
        autoCompleteValue: name,
        provinceId: +this.queryLoTrinh.tinhDen,
        shopState: "to",
      },
    };
    const sb = this.quanLyPhieuCongTacService
      .getListShopBox(requestShop, false)
      .subscribe((res) => {
        this.donViDenList.next(
          this.quanLyPhieuCongTacService.cbxDonViNoiBoDen.value
        );
      });
    this.subscriptions.push(sb);
  }

  filterStaff(name: string) {
    const requestStaff = {
      functionName: "getCbStaff",
      method: "POST",
      params: {
        userName: this.userName,
        staffType: "1",
        autoCompleteValue: name,
        provinceId: +this.queryLoTrinh.tinhDen,
      },
    };
    const sb = this.quanLyPhieuCongTacService
      .getListStaffBox(requestStaff, true)
      .subscribe((res) => {
        this.dauMoiNhanVienList.next(
          this.quanLyPhieuCongTacService.cbxNhanVienNoiBo.value
        );
      });
    this.subscriptions.push(sb);
  }

  displayFnShop(shop?: ShopDTO): string | undefined {
    return shop ? shop.shopName : undefined;
  }

  displayFnStaff(staff?: StaffDTO): string | undefined {
    return staff ? staff.staffName : undefined;
  }

  eSuaLoTrinh() {
    if (!this.isValidLoTrinhForm()) {
      this.loTrinhForm.markAllAsTouched();
      return;
    }

    this.queryLoTrinh.startDateLoTrinh = getDateInputWithFormat(
      this.queryLoTrinh.iValidStartDateLoTrinh
    );
    this.queryLoTrinh.endDateLoTrinh = getDateInputWithFormat(
      this.queryLoTrinh.iValidEndDateLoTrinh
    );

    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: "static",
    });
    modalRef.componentInstance.data = {
      type: "WARNING",
      title: "COMMON_MODAL.WARNING",
      message: this.translate.instant('CONFIRM.UPDATE_ROUTE_JOB'),
      continue: true,
      cancel: true,
      btn: [
        { text: "CANCEL", className: "btn-outline-warning btn uppercase mx-2" },
        { text: "CONTINUE", className: "btn btn-warning uppercase mx-2" },
      ],
    };
    modalRef.result.then(
      (result) => {
        const requestTarget = {
          functionName: "editJobRouting",
          method: "POST",
          params: {
            userName: this.userName,
            jobRoutingDTO: {
              id: this.id,
              jobRequestId: this.jobRequestId,
              fromShopId: this.loTrinhControl("donViDi").value.shopId,
              toShopId: this.loTrinhControl("donViDen").value.shopId,
              partnerStaffId:
                this.loTrinhControl("dauMoiNhanSu").value == "" || this.loTrinhControl("dauMoiNhanSu").value.staffId == ""
                  ? null
                  : +this.loTrinhControl("dauMoiNhanSu").value.staffId,
              partnerName: this.queryLoTrinh.doiTac,
              startProvinceId: this.queryLoTrinh.tinhDi,
              endProvinceId: this.queryLoTrinh.tinhDen,
              fromDate: this.queryLoTrinh.startDateLoTrinh,
              toDate: this.queryLoTrinh.endDateLoTrinh,
              name: this.queryLoTrinh.tenLoTrinh,
            },
          },
        };
        const rq = this.commonService
          .callAPICommon(requestTarget as RequestApiModel)
          .subscribe((res) => {
            if (res.errorCode == "0") {
              this.toastService.success(
                  this.translate.instant('MESSAGE.UPDATE_ROUTE_JOB_SUCCESS')
              );
              this.eClose();
            } else {
              this.toastService.error(res.description);
            }
          });
        this.subscriptions.push(rq);
      },
      (reason) => {}
    );
  }

  eClose() {
    this.activeModal.close();
  }

  eCloseWithoutEdit() {
    this.activeModal.dismiss();
  }

  // helpers for View
  isControlInvalidLoTrinh(controlName: string): boolean {
    const control = this.loTrinhForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isControlAutoCompleteInvalid(
    controlName: string,
    valueColumnName: string,
    isRequired: boolean
  ): boolean {
    const control = this.loTrinhForm.controls[controlName];
    if (typeof control.value == "string") {
      if (control.value != '' || isRequired) control.setErrors({ noSelect: true });
    } else {
      const valueColumn = control.value[valueColumnName];
      if (valueColumn == "" && isRequired) {
        control.setErrors({ required: true });
      }
    }
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasErrorDetail(validation, controlName): boolean {
    const control = this.loTrinhForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isValidLoTrinhForm(): boolean {
    let isValid = true;
    Object.keys(this.loTrinhForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.loTrinhForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    if (
      this.startDateLoTrinhErrorMsg !== "" ||
      this.endDateLoTrinhErrorMsg !== ""
    ) {
      isValid = false;
    }

    return isValid;
  }

  isControlInvalidDate(controlName: string): boolean {
    switch (controlName) {
      case "iValidStartDateLoTrinh":
        this.startDateLoTrinhErrorMsg = "";
        if (
          this.queryLoTrinh.iValidStartDateLoTrinh == undefined ||
          this.queryLoTrinh.iValidStartDateLoTrinh == null ||
          (typeof this.queryLoTrinh.iValidStartDateLoTrinh == "string" &&
            this.queryLoTrinh.iValidStartDateLoTrinh == "")
        ) {
          this.startDateLoTrinhErrorMsg = this.translate.instant(
            "VALIDATION.REQUIRED",
            { name: this.translate.instant("DATE.FROM_DATE") }
          );
          return true;
        } else if (
          typeof this.queryLoTrinh.iValidStartDateLoTrinh == "string"
        ) {
          let iValidStartDateLoTrinhStr: string =
            this.queryLoTrinh.iValidStartDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidStartDateLoTrinhStr)) {
            iValidStartDateLoTrinhStr = [
              iValidStartDateLoTrinhStr.substr(0, 2),
              iValidStartDateLoTrinhStr.substr(2, 2),
              iValidStartDateLoTrinhStr.substr(4, 4),
            ].join("/");
            if (!this.isValidDateForm(iValidStartDateLoTrinhStr)) {
              this.startDateLoTrinhErrorMsg = this.translate.instant(
                "VALIDATION.INVALID",
                { name: this.translate.instant("DATE.FROM_DATE") }
              );
              return true;
            }
          } else {
            this.startDateLoTrinhErrorMsg = this.translate.instant(
              "VALIDATION.INVALID",
              { name: this.translate.instant("DATE.FROM_DATE") }
            );
            return true;
          }
        } else if (
          this.queryLoTrinh.iValidStartDateLoTrinh &&
          typeof this.queryLoTrinh.iValidStartDateLoTrinh == "object"
        ) {
          // //check <= current date
          // let currentDate = new Date();
          // let currentNgbDate = new NgbDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          // if(this.afterDate(this.queryLoTrinh.iValidStartDateLoTrinh, currentNgbDate)) {
          //   this.startDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.AFTER_CURRENT_DATE', {name: this.translate.instant('DATE.FROM_DATE')});
          //   return true;
          // }

          //check fromDate <= toDate
          if (
            this.queryLoTrinh.iValidEndDateLoTrinh &&
            typeof this.queryLoTrinh.iValidEndDateLoTrinh == "object" &&
            this.afterDate(
              this.queryLoTrinh.iValidStartDateLoTrinh,
              this.queryLoTrinh.iValidEndDateLoTrinh
            )
          ) {
            this.startDateLoTrinhErrorMsg = this.translate.instant(
              "VALIDATION.FROM_DATE_BEFORE_TO_DATE"
            );
            return true;
          }
        }
        return false;

      case "iValidEndDateLoTrinh":
        this.endDateLoTrinhErrorMsg = "";
        if (
          this.queryLoTrinh.iValidEndDateLoTrinh == undefined ||
          this.queryLoTrinh.iValidEndDateLoTrinh == null ||
          (typeof this.queryLoTrinh.iValidEndDateLoTrinh == "string" &&
            this.queryLoTrinh.iValidEndDateLoTrinh == "")
        ) {
          this.endDateLoTrinhErrorMsg = this.translate.instant(
            "VALIDATION.REQUIRED",
            { name: this.translate.instant("DATE.TO_DATE") }
          );
          return true;
        } else if (typeof this.queryLoTrinh.iValidEndDateLoTrinh == "string") {
          let iValidEndDateLoTrinhStr: string =
            this.queryLoTrinh.iValidEndDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidEndDateLoTrinhStr)) {
            iValidEndDateLoTrinhStr = [
              iValidEndDateLoTrinhStr.substr(0, 2),
              iValidEndDateLoTrinhStr.substr(2, 2),
              iValidEndDateLoTrinhStr.substr(4, 4),
            ].join("/");
            return !this.isValidDateForm(iValidEndDateLoTrinhStr);
          } else {
            this.endDateLoTrinhErrorMsg = this.translate.instant(
              "VALIDATION.INVALID",
              { name: this.translate.instant("DATE.TO_DATE") }
            );
            return true;
          }
        } else if (
          this.queryLoTrinh.iValidEndDateLoTrinh &&
          typeof this.queryLoTrinh.iValidEndDateLoTrinh == "object"
        ) {
          // //check <= current date
          // let currentDate = new Date();
          // let currentNgbDate = new NgbDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          // if(this.afterDate(this.queryLoTrinh.iValidEndDateLoTrinh, currentNgbDate)) {
          //   this.endDateLoTrinhErrorMsg = this.translate.instant('VALIDATION.AFTER_CURRENT_DATE', {name: this.translate.instant('DATE.TO_DATE')});
          //   return true;
          // }

          //check fromDate <= toDate
          if (
            this.queryLoTrinh.iValidStartDateLoTrinh &&
            typeof this.queryLoTrinh.iValidStartDateLoTrinh == "object" &&
            this.afterDate(
              this.queryLoTrinh.iValidStartDateLoTrinh,
              this.queryLoTrinh.iValidEndDateLoTrinh
            )
          ) {
            this.endDateLoTrinhErrorMsg = this.translate.instant(
              "VALIDATION.FROM_DATE_BEFORE_TO_DATE"
            );
            return true;
          }
        }
        return false;
    }
    return false;
  }

  afterDate(date1: NgbDate, date2: NgbDate): boolean {
    if (date1.year < date2.year) return false;
    else if (date1.year > date2.year) return true;
    else {
      if (date1.month < date2.month) return false;
      else if (date1.month > date2.month) return true;
      else {
        if (date1.day <= date2.day) return false;
        else return true;
      }
    }
  }

  isValidDateForm(dateString): boolean {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
      return false;
    }

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    if (day > 0 && day <= monthLength[month - 1]) {
      return true;
    } else {
      return false;
    }
  }

  resetError(controlName: string) {
    switch (controlName) {
      case "iValidStartDateLoTrinh":
        this.startDateLoTrinhErrorMsg = "";
        break;
      case "iValidEndDateLoTrinh":
        this.endDateLoTrinhErrorMsg = "";
        break;
    }
  }

  formatDateValue(controlName: string) {
    switch (controlName) {
      case "iValidStartDateLoTrinh":
        let iValidStartDateLoTrinhStr;
        if (typeof this.queryLoTrinh.iValidStartDateLoTrinh == "string") {
          iValidStartDateLoTrinhStr = this.queryLoTrinh.iValidStartDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidStartDateLoTrinhStr)) {
            this.queryLoTrinh.iValidStartDateLoTrinh = new NgbDate(
              parseInt(iValidStartDateLoTrinhStr.substr(4, 4)),
              parseInt(iValidStartDateLoTrinhStr.substr(2, 2)),
              parseInt(iValidStartDateLoTrinhStr.substr(0, 2))
            );
          }
        }
        break;
      case "iValidEndDateLoTrinh":
        let iValidEndDateLoTrinhStr;
        if (typeof this.queryLoTrinh.iValidEndDateLoTrinh == "string") {
          iValidEndDateLoTrinhStr = this.queryLoTrinh.iValidEndDateLoTrinh;
          if (/^[0-9]{8}$/.test(iValidEndDateLoTrinhStr)) {
            this.queryLoTrinh.iValidEndDateLoTrinh = new NgbDate(
              parseInt(iValidEndDateLoTrinhStr.substr(4, 4)),
              parseInt(iValidEndDateLoTrinhStr.substr(2, 2)),
              parseInt(iValidEndDateLoTrinhStr.substr(0, 2))
            );
          }
        }
        break;
    }
  }

  loTrinhControl(controlName: string) {
    return this.loTrinhForm.controls[controlName];
  }

  castFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
