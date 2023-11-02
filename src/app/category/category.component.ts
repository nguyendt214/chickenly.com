import { Component } from '@angular/core';
import { MainService } from '../main/main.service';
import { UtilService } from '../main/util.service';
import { Category, Customer, School } from '../main/main.model';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  categories: Category[] = [];
  displayedColumns: string[] = ['name'];
  dataSource: Category[] = [];
  constructor(
    private mainService: MainService,
    private utilService: UtilService,
    ) {
    this.getList();
  }
  addNew() {
    this.utilService.gotoPage('category/add');
  }
  delete(e: any) {
    this.mainService.kDelete(e, this.mainService.mO.school).then(
      () => {
        this.getList();
      }
    );
  }
  edit(e: any){
    this.utilService.gotoPage('category/edit/' + e?.key);
  }
  getList() {
    this.mainService.retrieveData(this.mainService.mO.category).subscribe(
      (data: any) => {
        this.categories = this.dataSource = data;
      }
    );
  }
}
