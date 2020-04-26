export const environment = {
  production: true,
  fetchDataMSReset: 30 * 60 * 1000, // 30 min in milliseconds
  nodeServer: 'https://job-seeker-server.herokuapp.com/',
  autoLogoutPassJWTExpirationMS: 30 * 60 * 1000, // 30 min in milliseconds
  splitCompanyOldImagesBy: '%%RandomjoiN&&',
  splitSearchQueryBy: ',',
  firebaseAPIKey: 'AIzaSyC546Xc5G1RCnmz3atF4BQ4NtEkD9XkkfY',
  firebaseAuthDomain: 'jobseeker-68c66.firebaseapp.com',
  firebaseStorageBucket: 'jobseeker-68c66.appspot.com',
  firebaseProjectId: 'jobseeker-68c66',
  imagesFolder: 'images/',
  filesFolder: 'files/',
  uploadFileSizeLimitBytes: 2 * 1024 * 1024 // 2 * 1024 KB * 1024 Bytes
};
