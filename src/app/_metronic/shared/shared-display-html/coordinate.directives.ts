import { Directive } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[coordinate]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: CoordinateDirective, multi: true }
  ]
})
export class CoordinateDirective implements Validator {
  constructor() {}

  validate(c: AbstractControl): { [key: string]: any } {
    if (c.value && !/^[0-9]*\\.?[0-9]*$/gm.test(c.value)) {
      return {
        coordinate: 'Invalid coordinate'
      };
    }

    return null;
  }
}
