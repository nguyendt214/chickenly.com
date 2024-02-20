import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  imgSrc: string;
}

@Component({
  selector: 'dialog-img-popin',
  templateUrl: './dialog.html',
})
export class ImagePopinDialog implements OnInit {
  imgSrc: string;

  constructor(
    public dialogRef: MatDialogRef<ImagePopinDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.imgSrc = this.data.imgSrc;
  }

}
