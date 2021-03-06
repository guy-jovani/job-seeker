// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  fetchDataMSReset: 30 * 60 * 1000, // 30 min in milliseconds
  nodeServer: 'http://localhost:4300/',
  autoLogoutPassJWTExpirationMS: 30 * 60 * 1000, // 30 min in milliseconds
  splitCompanyOldImagesBy: '%%RandomjoiN&&',
  splitSearchQueryBy: ',',
  firebaseAPIKey: 'AIzaSyC546Xc5G1RCnmz3atF4BQ4NtEkD9XkkfY',
  firebaseAuthDomain: 'jobseeker-68c66.firebaseapp.com',
  firebaseStorageBucket: 'gs://jobseeker-68c66.appspot.com',
  firebaseProjectId: 'jobseeker-68c66',
  imagesFolder: 'images/',
  filesFolder: 'files/',
  docsPerPage: 10,
  uploadFileSizeLimitBytes: 2 * 1024 * 1024 // 2 * 1024 KB * 1024 Bytes
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
