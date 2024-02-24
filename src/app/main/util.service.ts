import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(
    private router: Router,
  ) {
  }
  googleDriveURL = 'https://drive.google.com/thumbnail?id=';

  gotoPage(path: string) {
    this.router.navigate([path]);
  }

  groupItemBy(array, property) {
    const hash = {}, props = property.split('.');
    for (let i = 0; i < array.length; i++) {
      const key = props.reduce(function (acc, prop) {
        return acc && acc[prop];
      }, array[i]);
      if (!hash[key]) hash[key] = [];
      hash[key].push(array[i]);
    }
    return hash;
  }

  getDateWithoutTime(date: Date) {
    return date.setUTCHours(0, 0, 0, 0);
  }

  getDateFromString(dateString: string) {
    const date = dateString.split('/');
    return new Date(date[1] + '/' + date[0] + '/' + date[2]);
  }

  getImageURLFromGoogleDrive(url: string) {
    const id = url.split("/d/")[1];
    return this.googleDriveURL + id.split("/")[0];
  }
}
