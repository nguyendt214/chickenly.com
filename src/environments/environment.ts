/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyB4F4fuK6DyVeWfAIQcQfwtmq4tKWsq5D0',
    authDomain: "chickenly.firebaseapp.com",
    projectId: "chickenly",
    storageBucket: "chickenly.appspot.com",
    messagingSenderId: "690793375468",
    appId: "1:690793375468:web:affc99d7ea97ebb5ec27c9",
    measurementId: "G-JDCKD473BF",
  }
};
