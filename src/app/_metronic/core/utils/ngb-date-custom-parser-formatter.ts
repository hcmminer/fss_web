import {NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Injectable} from '@angular/core';

function padNumber(value: number | null) {
  if (!isNaN(value) && value !== null) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const dateParts = value.trim().split('/');

      const dateObj: NgbDateStruct = {day: null as any, month: null as any, year: null as any};
      const dateLabels = Object.keys(dateObj);

      dateParts.forEach((datePart, idx) => {
        dateObj[dateLabels[idx]] = parseInt(datePart, 10) || (null as any);
      });
      return dateObj;
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ?
      `${padNumber(date.day)}/${padNumber(date.month)}/${date.year || ''}` :
      '';
  }
}
