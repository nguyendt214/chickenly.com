import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

const webpush = require('web-push');
const vapidKeys = {
  "publicKey": "BKOjBq4OEn4HGHKt6_5FHoCJDRvBEeIsvc3pS8U8fBdAaBbF4pESWJHFX9JB9VqrFhpcSIGv4Ii_CffGACTTq5k",
  "privateKey": "6B-lPk_AY4nt1nPF9-0U6HDnHmzjYe4uNLl-aZlfvUM"
};
webpush.setVapidDetails(
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  constructor(
    private _swPush: SwPush,
  ) {
  }

  pushNotification(title = 'KEVIN', message = 'Message') {
    // get client subscription config from db
    const subscription = {
      endpoint: '',
      expirationTime: null,
      keys: {
        auth: '',
        p256dh: '',
      },
    };
    const payload = {
      notification: {
        title: 'Title',
        body: 'This is my body',
        icon: 'assets/icons/icon-384x384.png',
        actions: [
          {action: 'bar', title: 'Focus last'},
          {action: 'baz', title: 'Navigate last'},
        ],
        data: {
          onActionClick: {
            default: {operation: 'openWindow'},
            bar: {
              operation: 'focusLastFocusedOrOpen',
              url: '/signin',
            },
            baz: {
              operation: 'navigateLastFocusedOrOpen',
              url: '/signin',
            },
          },
        },
      },
    };
    const options = {
      vapidDetails: {
        // subject: 'mailto:example_email@example.com',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
      },
      TTL: 60,
    };
    // send notification
    // this._swPush.notificationClicks(subscription, JSON.stringify(payload), options)
    //   .then((_) => {
    //     console.log('SENT!!!');
    //     console.log(_);
    //   })
    //   .catch((_) => {
    //     console.log(_);
    //   });

  }
}
