import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InlineSVGModule} from 'ng-inline-svg';
import {TranslateModule} from '@ngx-translate/core';
import {CustomDropzoneComponent} from './custom-dropzone.component';
import {CustomDropzonePreviewComponent} from './custom-dropzone-preview/custom-dropzone-preview.component';
import {CustomDropzoneImagePreviewComponent} from './custom-dropzone-preview/custom-dropzone-image-preview/custom-dropzone-image-preview.component';
import {CustomDropzoneRemoveBadgeComponent} from './custom-dropzone-preview/custom-dropzone-remove-badge/custom-dropzone-remove-badge.component';
import {CustomDropzoneVideoPreviewComponent} from './custom-dropzone-preview/custom-dropzone-video-preview/custom-dropzone-video-preview.component';
import {CustomDropzoneLabelDirective} from './custom-dropzone-label.directive';

@NgModule({
  declarations:
    [
      CustomDropzoneComponent,
      CustomDropzonePreviewComponent,
      CustomDropzoneImagePreviewComponent,
      CustomDropzoneRemoveBadgeComponent,
      CustomDropzoneVideoPreviewComponent,
      CustomDropzoneLabelDirective,
    ],
  imports: [
    CommonModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    InlineSVGModule,
  ],
  exports:
  [
    CustomDropzoneComponent,
    CustomDropzonePreviewComponent,
    CustomDropzoneImagePreviewComponent,
    CustomDropzoneRemoveBadgeComponent,
    CustomDropzoneVideoPreviewComponent,
    CustomDropzoneLabelDirective
  ]
})
export class CustomDropzoneModule {}
