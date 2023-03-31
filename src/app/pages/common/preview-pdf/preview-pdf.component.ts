import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-preview-pdf',
  templateUrl: './preview-pdf.component.html',
  styleUrls: ['./preview-pdf.component.scss']
})
export class PreviewPdfComponent implements OnInit {

  srcPreviewPdf: any;

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  eClose() {
    this.activeModal.close();
  }

  eCloseWithoutEdit() {
    this.activeModal.dismiss();
  }

}
