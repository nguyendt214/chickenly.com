import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessageService {
  title = 'fcm-angular-demo';
  message$: Observable<any>;

  constructor(private messaging: AngularFireMessaging) {
  }

  checkSendMessage() {
    // Request permission to receive notifications
    this.messaging.requestPermission.subscribe(
      () => {
        console.log('Permission granted');
      },
      (error) => {
        console.log('Permission denied', error);
      }
    );

    // Get the current FCM token
    this.messaging.getToken.subscribe(
      (token) => {
        console.log('Token', token);
        // You can send this token to your server and store it there
        // You can also use this token to subscribe to topics
      },
      (error) => {
        console.log('Token error', error);
      }
    );

    // Listen for messages from FCM
    this.message$ = this.messaging.messages;
    this.message$.subscribe(
      (message) => {
        console.log('Message', message);
        // You can display the message or do something else with it
      },
      (error) => {
        console.log('Message error', error);
      }
    );
  }
}
