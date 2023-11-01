import { Component } from '@angular/core';
import { MainService } from '../../main/main.service';
import { UtilService } from '../../main/util.service';
import { Customer } from '../../main/main.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {
  customer: Customer = new Customer();
  key: string | any;
  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    protected activeRoute: ActivatedRoute,
  ) {
      this.key = this.activeRoute.snapshot.paramMap.get('key');
      this.mainService.kDetail(this.key, this.mainService.mO.customer).subscribe(
        (data: any) => {
          this.customer = data;
        }
      );
  }

  edit(){
    this.mainService.kUpdate(this.key, this.customer, this.mainService.mO.customer).then(
      () => this.utilService.gotoPage('customers')
    );
  }
}
