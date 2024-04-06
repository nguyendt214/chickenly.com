import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { LocalStorageService } from "./local-storage.servise";

export class FileUpload {
  key: string;
  name: string;
  url: string;
  file: File;
  date?: string;
  dateTimestamp?: number;
  update?: string;
  updated?: string;

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
  lcKey = this.dbPath.replace('/', '');
  lcKeyForce = this.lcKey + 'Force';
  lcKeyDate = this.lcKey + 'Date';

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private lc: LocalStorageService,
  ) {
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
          fileUpload.date = (new Date()).toISOString();
          fileUpload.dateTimestamp = new Date().getTime();
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
    if (this.lc.getItem(this.lcKey) === 'undefined') {
      this.lc.removeItem(this.lcKey);
    } else if (this.lc.getItem(this.lcKey) && !this.lc.getBool(this.lcKeyForce)) {
      return of(this.lc.getObject(this.lcKey));
    }
    return this.modelRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({key: c.payload.key, ...c.payload.val()}),
        ),
      ),
    );
  }

  storeData(data) {
    this.lc.setBool(this.lcKeyForce, false);
    this.lc.setObject(this.lcKey, this.getLimitLocalStorageCache(data));
  }

  getLimitLocalStorageCache(data: any, number = 500) {
    return data?.slice((data.length - number), data.length) ?? [];
  }

  getLastData(): Observable<any> {
    if (this.lc.getItem(this.lcKey) && !this.lc.getBool(this.lcKeyForce)) {
      const lcData: any = this.lc.getObject(this.lcKey);
      console.log('Use FILEs Cache!!!');
      return of(lcData);
    }
    console.log('Get last 500 Files!!!');
    return this.db.list(this.dbPath, ref =>
      ref.orderByChild('dateTimestamp')
        .limitToLast(500)
    ).valueChanges();
  }

  getDataFromCache() {
    return this.lc.getObject(this.lcKey) ?? [];
  }

  create(o: FileUpload): any {
    o.date = (new Date()).toISOString();
    return this.modelRef.push(o);
  }

  update(key: string, value: any): Promise<void> {
    value.update = (new Date()).toISOString();
    return this.modelRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.modelRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.modelRef.remove();
  }
}
