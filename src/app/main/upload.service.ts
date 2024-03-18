import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

export class FileUpload {
  key: string;
  name: string;
  url: string;
  file: File;

  constructor(file: File) {
    this.file = file;
  }
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private dbPath = '/uploads';
  cacheUploadFiles: any;
  modelRef: AngularFireList<FileUpload>;

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) {
    this.modelRef = db.list(this.dbPath);
  }

  pushFileToStorage(fileUpload: FileUpload): Observable<number> {
    const filePath = `${this.dbPath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
        });
      }),
    ).subscribe();

    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.db.list(this.dbPath).push(fileUpload);
  }

  deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<any> {
    return this.db.list(this.dbPath).remove(key);
  }

  private deleteFileStorage(name: string): void {
    const storageRef = this.storage.ref(this.dbPath);
    storageRef.child(name).delete();
  }

  getFiles(numberItems): AngularFireList<FileUpload> {
    return this.db.list(this.dbPath, ref =>
      ref.limitToLast(numberItems));
  }

  getLastFile(): Observable<any> {
    return this.db.list(this.dbPath, ref => ref.orderByChild('timestamp').startAt(Date.now())).stateChanges();
  }

  getAll(): AngularFireList<FileUpload> {
    return this.modelRef;
  }
  getAll2(): Observable<any> {
    if (this.cacheUploadFiles) {
      return of(this.cacheUploadFiles);
    }
    return this.modelRef.valueChanges();
  }

  getAll3() {
    return this.modelRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    );
  }

  create(o: FileUpload): any {
    return this.modelRef.push(o);
  }

  update(key: string, value: any): Promise<void> {
    return this.modelRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.modelRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.modelRef.remove();
  }
}
