import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import { isBuffer } from 'util';

export const convertStringToNGDate = (strDate: string) => {
  let date = new Date(strDate);

  if (!date) {
    date = new Date();
  }

  return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export const join = (t, a, s) => {
  return a
    .map((m) => {
      const formatDt = new Intl.DateTimeFormat('en', m);
      return formatDt.format(t);
    })
    .join(s);
};

export const getDateInput = (date: {}) => {
  try {
    return new Date(date['year'], date['month'] - 1, date['day'] + 1).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const getDateInputWithFormat = (date, format: string = 'dd/MM/yyy') => {
  if (!date || date === '') {
    return '';
  }

  let result;

  try {
    result = new Date(date['year'], date['month'] - 1, date['day'] ? date['day'] : '01');
  } catch (e) {
    return '';
  }

  return formatDate(result, format, 'en-US');
};

export const timeToName = (t) => {
  let a = new Date(t).toString().split(/\s/);
  let b =
    a[2] +
    '/' +
    {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    }[a[1]] +
    '/' +
    a[3] +
    ' ' +
    a[4];

  // '24/03/2023 14:12:55'
  let b1 = b.split(' ')[0];
  let b11 = b1.replace(/\//g, '-');

  let b2 = b.split(' ')[1];
  let b21 = b2.split(':');
  let b211 = b21[0] + 'h' + b21[1] + 'm' + b21[2] + 's';

  let name = b11 + '_' + b211;
  return name;
};

export const arrayToTree = (arr, parentIdStr = '') => {
  return arr
    .filter((item) => item.parentIdStr === parentIdStr)
    .map((child) => ({ ...child, children: arrayToTree(arr, child.kpiManagerIdStr) }));
};
