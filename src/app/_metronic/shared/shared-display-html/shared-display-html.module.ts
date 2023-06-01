import { TruncatePipe } from './../../../utils/TruncatePipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SafeHtmlPipe} from '../../../pipes/safeHtml.pipe';
import {CoordinateDirective} from './coordinate.directives';
import { SafeResourceUrlPipe } from '../../../pipes/safeResourceUrl.pipe';
import { NumbersOnlyDirective } from './only-number.directives';
import { StylePaginatorDirective } from './style-paginator.directive';



@NgModule({
  declarations: [SafeHtmlPipe, SafeResourceUrlPipe, CoordinateDirective, NumbersOnlyDirective, StylePaginatorDirective, TruncatePipe],
  exports: [SafeHtmlPipe, SafeResourceUrlPipe, CoordinateDirective, NumbersOnlyDirective, StylePaginatorDirective,TruncatePipe],
  imports: [
    CommonModule
  ]
})
export class SharedDisplayHtmlModule { }
