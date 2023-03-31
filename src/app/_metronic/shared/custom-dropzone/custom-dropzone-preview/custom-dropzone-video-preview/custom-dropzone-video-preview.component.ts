import {Component, OnDestroy, OnInit} from '@angular/core';
import {CustomDropzonePreviewComponent} from '../custom-dropzone-preview.component';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-dropzone-video-preview',
  template: `
    <video *ngIf="sanitizedVideoSrc" controls (click)="$event.stopPropagation()">
      <source [src]="sanitizedVideoSrc" />
    </video>
    <ng-content select="custom-dropzone-label"></ng-content>
    <custom-dropzone-remove-badge *ngIf="removable" (click)="_remove($event)">
    </custom-dropzone-remove-badge>
	`,
  styleUrls: ['./custom-dropzone-video-preview.component.scss'],
  providers: [
    {
      provide: CustomDropzonePreviewComponent,
      useExisting: CustomDropzoneVideoPreviewComponent
    }
  ]
})
export class CustomDropzoneVideoPreviewComponent extends CustomDropzonePreviewComponent implements OnInit, OnDestroy {

  constructor(
    sanitizer: DomSanitizer
  ) {
    super(sanitizer);
  }

  /** The video data source. */
  sanitizedVideoSrc: SafeUrl;

  private videoSrc: string;

  ngOnInit() {
    if (!this.file) {
      console.error('No file to read. Please provide a file using the [file] Input property.');
      return;
    }
    this.videoSrc = URL.createObjectURL(this.file);
    this.sanitizedVideoSrc = this.sanitizer.bypassSecurityTrustUrl(this.videoSrc);
  }

  ngOnDestroy() {
    URL.revokeObjectURL(this.videoSrc);
  }
}
