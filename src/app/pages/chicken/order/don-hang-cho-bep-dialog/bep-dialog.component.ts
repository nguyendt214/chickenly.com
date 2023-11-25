import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Cart } from '../../../../main/order.service';

export interface DialogData {
  cart: Cart[];
  dateStr: string;
  comQty: number;
}

@Component({
  selector: 'dialog-overview-example-dialog-bep',
  templateUrl: './dialog.html',
})
export class BepDialog implements OnInit {
  cart: Cart[] = [];
  dateStr: string;
  comQty = 0;

  constructor(
    public dialogRef: MatDialogRef<BepDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit() {
    this.cart = this.data.cart;
    this.dateStr = this.data.dateStr;
    this.comQty = this.data.comQty;
  }

  printOrder() {
    window.print();
  }

}
