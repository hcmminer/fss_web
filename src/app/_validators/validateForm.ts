import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minValue(x): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (+control.value < x) {
      return { minValue: true };
    }
    return null;
  };
}
export function maxValue(x): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (+control.value > x) {
      return { maxValue: true };
    }
    return null;
  };
}

export function removeNumberComma(x) {
  if (x.toString().includes(',')) {
    return x.replaceAll(',', '');
  } else {
    return x;
  }
}
