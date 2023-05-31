import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { RequestApiModelOld } from '../_models/requestOld-api.model';
import { HTTPService } from './http.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from './global.service';
import { CONFIG } from 'src/app/utils/constants';
import { catchError, finalize, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class openingBalanceService {
  subscriptions: Subscription[] = [];
  cbxOrganisation = new BehaviorSubject<any[]>([]);
  cbxTypeOfAsset = new BehaviorSubject<any[]>([]);
  cbxSourceOfAsset = new BehaviorSubject<any[]>([]);

  //auto complete mã tài sản con mục điều chuyển tài sản
  cbxAssetCodeIncrease = new BehaviorSubject<any[]>([]);
  //auto complete mã tàn sản thanh lý cũ 
  cbxAssetOldCodeLiquidate = new BehaviorSubject<any[]>([]);
  // cbxAssetCodeReportBC = new BehaviorSubject<any[]>([]);

  //auto complete mã tìa sản mục phát sinh tăng xây dựng
  cbxAssetCodeOpeningBalance = new BehaviorSubject<any[]>([]);

  // autocomplete mã tài sản cha đầu kỳ xâu dưng, tài sản
  cbxparentBcParentAssetCode = new BehaviorSubject<any[]>([]);
  cbxparentAssetParentAssetCode = new BehaviorSubject<any[]>([]);

  // autocomplete mã tài sản cha điều chuyển
  cbxParentAssetCodeIncrease = new BehaviorSubject<any[]>([]);
  //só dư đầu kỳ
  getErrOpeningBalanceFile = new BehaviorSubject<any>({}); //v
  getSuccessOpeningBalanceFile = new BehaviorSubject<any>({});
  listOpeningBalance = new BehaviorSubject<any[]>([]);
  errOpeningBalanceList = new BehaviorSubject<any[]>([]);

  //phát sinh tăng
  getErrImportIncreaseFile = new BehaviorSubject<any>({}); //v
  getSuccessImportIncreaseFile = new BehaviorSubject<any>({});
  listImportIncrease = new BehaviorSubject<any[]>([]);
  errImportIncreaseList = new BehaviorSubject<any[]>([]);

  //phát sinh giảm
  getErrBcDecreaseFile = new BehaviorSubject<any>({}); //v
  getSuccessBcDecreaseFile = new BehaviorSubject<any>({});
  listBcDecrease = new BehaviorSubject<any[]>([]);
  errBcDecreaseList = new BehaviorSubject<any[]>([]);
  cbxListAssetCodeDecrease = new BehaviorSubject<any[]>([]);

  //report
  listDataReport = new BehaviorSubject<any[]>([]);

  //transfer-asset

  getErrTransferAssetFile = new BehaviorSubject<any>({}); //v
  getSuccessTransferAssetFile = new BehaviorSubject<any>({});
  listTransferAsset = new BehaviorSubject<any[]>([]);
  errTransferAssetList = new BehaviorSubject<any[]>([]);

  //liquidate-asset
  getErrLiquidateAssetFile = new BehaviorSubject<any>({}); //v
  getSuccessLiquidateAssetFile = new BehaviorSubject<any>({});
  listLiquidateAsset = new BehaviorSubject<any[]>([]);
  errLiquidateAssetList = new BehaviorSubject<any[]>([]);

  //ImportIncrease-asset
  getErrImportIncreaseAssetFile = new BehaviorSubject<any>({}); //v
  getSuccessImportIncreaseAssetFile = new BehaviorSubject<any>({});
  listImportIncreaseAsset = new BehaviorSubject<any[]>([]);
  errImportIncreaseAssetList = new BehaviorSubject<any[]>([]);

  initHeader: {};
  header = {
    'Content-Type': 'application/json',
  };
  constructor(
    private httpService: HTTPService,
    private toastrService: ToastrService,
    public translateService: TranslateService,
    private commonService: CommonService,
    public spinner: NgxSpinnerService,
    private httpClient: HttpClient,
    private globalService: GlobalService,
  ) {
    const token = localStorage.getItem(CONFIG.KEY.TOKEN);
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    this.initHeader = {
      Authorization: `Bearer ${token}`,
      'Accept-Language': language,
      ...this.header,
    };
  }
  getListOrganisation(query: RequestApiModelOld, redirectFunction, allowDefault: boolean) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxOrganisation.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxOrganisation.next(response.data);
          } else {
            this.cbxOrganisation.next([]);
          }
          if (allowDefault)
            this.cbxOrganisation.value.unshift({
              code: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getCbxTypeOfAsset(query: RequestApiModelOld, redirectFunction, allowDefault: boolean) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxTypeOfAsset.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxTypeOfAsset.next(response.data);
          } else {
            this.cbxTypeOfAsset.next([]);
          }
          if (allowDefault)
            this.cbxTypeOfAsset.value.unshift({
              name: '',
            });
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }
  // get paren asset code autocomplete bên đầu kỳ tài sản
  getCbxAssetParentAssetCode(query: RequestApiModelOld, redirectFunction, str?: any) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxparentAssetParentAssetCode.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let tempData = [];
            tempData = response.data
            if (str && str != '') {
              tempData = tempData.filter((item) => {
                const regex = new RegExp(str, 'gi'); // 'gi' để bỏ qua phân biệt chữ hoa/thường
                return regex.test(item.assetCode);
              });
            }

            this.cbxparentAssetParentAssetCode.next(tempData);
          } else {
            this.cbxparentAssetParentAssetCode.next([]);
          }
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

   // autoComplete mã tài sản cha transfer
   getCbxParentAssetCodeIncrese(query: RequestApiModelOld, redirectFunction, str?: any, assetCode?:any) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxParentAssetCodeIncrease.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let tempData = [];
            tempData = response.data
            if (str && str != '') {
              tempData = response.data.filter((item) => {
                const regex = new RegExp(str, 'gi'); // 'gi' để bỏ qua phân biệt chữ hoa/thường
                return regex.test(item.assetCode);
              });
            }

            if (assetCode && assetCode != '') {
              tempData = tempData.filter((item) => {
                
                return item.assetCode != assetCode;
              });
            }
            this.cbxParentAssetCodeIncrease.next(tempData);
          } else {
            this.cbxParentAssetCodeIncrease.next([]);
          }
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  // autoComplete mã tài sản cha đầu kỳ xây dựng
  getCbxBcParentAssetCode(query: RequestApiModelOld, redirectFunction, str?: any) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxparentBcParentAssetCode.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let tempData = [];
            tempData = response.data
            if (str && str != '') {
              tempData = response.data.filter((item) => {
                const regex = new RegExp(str, 'gi'); // 'gi' để bỏ qua phân biệt chữ hoa/thường
                return regex.test(item.assetCode);
              });
            }

            this.cbxparentBcParentAssetCode.next(tempData);
          } else {
            this.cbxparentBcParentAssetCode.next([]);
          }
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }
  //auto complete mã tài sản phát sinh tăng
  
  getCbxOpeningBalance(query: RequestApiModelOld, redirectFunction, str?: any) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxAssetCodeOpeningBalance.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let tempData = [];
            if (str && str != '') {
              tempData = tempData.filter((item) => {
                const regex = new RegExp(str, 'gi'); // 'gi' để bỏ qua phân biệt chữ hoa/thường
                return regex.test(item.assetCode);
              });
            }

            this.cbxAssetCodeOpeningBalance.next(tempData);
          } else {
            this.cbxAssetCodeOpeningBalance.next([]);
          }
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }


  // mã tài sản con điều chuyển thanh lý
  getCbxAssetCodeIncrease(query: RequestApiModelOld, redirectFunction, str?: any) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxAssetCodeIncrease.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let tempData = [];
            tempData = response.data.filter((item) => {
              return item.isUpdate == 1;
            });
            if (str && str != '') {
              tempData = tempData.filter((item) => {
                const regex = new RegExp(str, 'gi'); // 'gi' để bỏ qua phân biệt chữ hoa/thường
                return regex.test(item.assetCode);
              });
            }

            this.cbxAssetCodeIncrease.next(tempData);
          } else {
            this.cbxAssetCodeIncrease.next([]);
          }
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getCbxOldAssetCodeLiquidate(query: RequestApiModelOld, redirectFunction, str?: any) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxAssetOldCodeLiquidate.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let tempData = response.data;
            if (str && str != '') {
              tempData = tempData.filter((item) => {
                const regex = new RegExp(str, 'gi'); // 'gi' để bỏ qua phân biệt chữ hoa/thường
                return regex.test(item.assetCode);
              });
            }

            this.cbxAssetOldCodeLiquidate.next(tempData);
          } else {
            this.cbxAssetOldCodeLiquidate.next([]);
          }
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListAssetCodeDecrease(query: RequestApiModelOld, redirectFunction, str?: any) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxListAssetCodeDecrease.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let tempData = [];
            tempData = response.data;
            if (str && str != '') {
              tempData = tempData.filter((item) => {
                const regex = new RegExp(str, 'gi'); // 'gi' để bỏ qua phân biệt chữ hoa/thường
                return regex.test(item.assetCode);
              });
            }
            this.cbxListAssetCodeDecrease.next(tempData);
          } else {
            this.cbxListAssetCodeDecrease.next([]);
          }
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  //AssetCodeReportBC
  // getListAssetCodeReportBC(query: RequestApiModelOld, redirectFunction, allowDefault: boolean) {
  //   const request = this.globalService
  //     .globalApi(query, redirectFunction)
  //     .pipe(
  //       map((response) => {
  //         if (response.errorCode != '0') {
  //           this.cbxAssetCodeReportBC.next([]);
  //           throw new Error(response.description);
  //         }
  //         if (typeof response.data !== 'undefined' && response.data !== null) {
  //           this.cbxAssetCodeReportBC.next(
  //             response.data.filter(
  //               (value, index, self) => index === self.findIndex((t) => t.assetCode === value.assetCode),
  //             ),
  //           );
  //         } else {
  //           this.cbxAssetCodeReportBC.next([]);
  //         }
  //       }),
  //       catchError((err) => {
  //         // this.toastrService.error(err.error?.message || err.message, 'Error');
  //         return of(undefined);
  //       }),
  //       finalize(() => {}),
  //     )
  //     .subscribe();
  //   this.subscriptions.push(request);
  // }

  //cbx nguồn tài sản
  getSourceOfAsset(query: RequestApiModelOld, redirectFunction, allowDefault: boolean) {
    const request = this.globalService
      .globalApi(query, redirectFunction)
      .pipe(
        map((response) => {
          if (response.errorCode != '0') {
            this.cbxSourceOfAsset.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxSourceOfAsset.next(response.data);
          } else {
            this.cbxSourceOfAsset.next([]);
          }
          if (allowDefault)
            this.cbxSourceOfAsset.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          // this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }
}
