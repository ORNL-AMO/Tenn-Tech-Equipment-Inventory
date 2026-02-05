import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagePasser {
  private readonly blobSubject = new BehaviorSubject<Blob | null>(null);
 
  setBlob(blob: Blob): void {
    this.blobSubject.next(blob);
  }
 
  blob$(): Observable<Blob | null> {
    return this.blobSubject.asObservable();
  }
 
  get currentBlob(): Blob | null {
    return this.blobSubject.value;
  }
 
  clear(): void {
    this.blobSubject.next(null);
  }
}