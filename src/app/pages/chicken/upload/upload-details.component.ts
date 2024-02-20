import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUpload, FileUploadService } from '../../../main/upload.service';

@Component({
  selector: 'app-upload-details',
  templateUrl: './upload-details.component.html',
})
export class UploadDetailsComponent implements OnInit {
  @Input() fileUpload: FileUpload;
  @Input() allowDelete: boolean = true;
  @Output() deleteFile: EventEmitter<any> = new EventEmitter();
  @Output() showImg: EventEmitter<any> = new EventEmitter();

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
  }

  deleteFileUpload(fileUpload): void {
    this.uploadService.deleteFile(fileUpload);
    this.deleteFile.emit(fileUpload);
  }
  showImage(fileUpload) {
    this.showImg.emit(fileUpload.url);
  }
}
