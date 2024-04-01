/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { SwPush } from '@angular/service-worker';
import { PushNotificationService } from './main/push-notification.service';
import { FirebaseMessageService } from './main/firebase-message.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'BF-kN6-BdCXP_yV7m2Ii2IXHHv23ttrtPAGA5n4Y9OBwkyDpTfEs1QxgAiWypnDldgqlJuIZYyzMXW5NiteFR80';

  constructor(
    private analytics: AnalyticsService,
    private seoService: SeoService,
    private _swPush: SwPush,
    // private _kswPush: PushNotificationService,
    private firebaseMessageService: FirebaseMessageService,
  ) {
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
    // const requestSubscription = () => {
    //   if (!this._swPush.isEnabled) {
    //     console.log("Notification is not enabled.");
    //     return;
    //   } else {
    //     console.log("Notification is enabled.");
    //   }
    //
    //   this._swPush.requestSubscription({
    //     serverPublicKey: '<VAPID_PUBLIC_KEY>'
    //   }).then((_) => {
    //     console.log(JSON.stringify(_));
    //   }).catch((_) => console.log);
    // };


    // this.firebaseMessageService.checkSendMessage();
  }
}

