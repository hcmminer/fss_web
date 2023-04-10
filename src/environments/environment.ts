// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: 'v01ems',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: false,
  // apiUrl: 'http://183.182.100.186:8086/nqm-gw/api/v1/redirect', // smv
  // apiUrl: 'http://10.120.44.68:8086/nqm-gw/api/v1/redirect', // smv
  apiUrl: 'http://10.120.44.68:8885/fss/api', // smv
  // apiUrl: 'http://localhost:8322/api', // dev
  // apiUrl: 'http://183.182.100.186:8086/cms-gw/api/v1/redirect', // dev
  // apiUrl: 'https://183.182.118.7:9094/nqm-gw/api/v1/redirect', // real
  defaultLanguage: 'vi',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
