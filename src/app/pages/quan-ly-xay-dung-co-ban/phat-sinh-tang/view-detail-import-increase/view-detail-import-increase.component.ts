import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, EventEmitter, Inject, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/pages/_services/common.service';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { CONFIG } from 'src/app/utils/constants';

@Component({
  selector: 'app-view-detail-import-increase',
  templateUrl: './view-detail-import-increase.component.html',
  styleUrls: ['./view-detail-import-increase.component.scss']
})
export class ViewDetailImportIncreaseComponent implements OnInit {
  data;
  currentPage = 1;
  pageSize;
  private subscriptions: Subscription[] = [];
  @Output() reloadDataEvent = new EventEmitter<any>();
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoading$ = false;
  userRes: any;
  userName: any;
  dataSource: MatTableDataSource<any>;
  private modal: any;
  // required
  columnsToDisplay = [
    'index',
    'organisation',
    'contract',
    // 'parentAssetCode',
    'assetCode',
    'labor',
    'material',
    'constructionDateStr',
    'createdDatetimeStr',
  ];

  constructor(
    public router: Router,
    public translate: TranslateService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    public spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal,
    private globalService: GlobalService,
    private _liveAnnouncer: LiveAnnouncer,
    
    @Inject(Injector) private readonly injector: Injector,
  ) { }

  ngOnInit() {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.getDetailBcOpening();
  }
  getDetailBcOpening() {
    const reqTar = {
      userName: this.userName,
      searchDTO:{ 
        basicConstructionId : this.data.basicConstructionId
    }
    };
    const subCall = this.globalService
      .globalApi(reqTar, 'get-detail-bc-increase')
      .subscribe((res) => {
        this.isLoading$ = false;
        if (res.errorCode == '0') {
          console.log(res);
          
          this.dataSource = new MatTableDataSource(
            res.data
          );
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        } else {   
          this.dataSource =  new MatTableDataSource([]);
          this.toastService.error(res.description);
        }
      });
    this.subscriptions.push(subCall);
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


  eClose() {
    this.activeModal.close();
  }


  onPaginateChange(event) {
    if (event) {
      this.currentPage = event.pageIndex;
      this.pageSize = event.pageSize;
    }
  }
 

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
