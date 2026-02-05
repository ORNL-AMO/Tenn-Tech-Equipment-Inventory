import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagePasser {
  private readonly fileSubject = new BehaviorSubject<File | null>(null);

  // If you already have a File, set it directly
  setFile(file: File): void {
    this.fileSubject.next(file);
  }

  // If you have a Blob (like from canvas/webcam), convert it to a File and set it
  setBlobAsFile(blob: Blob, filename = 'capture.png'): void {
    const type = blob.type || 'image/png';
    const file = new File([blob], filename, { type });
    this.fileSubject.next(file);
  }

  file$(): Observable<File | null> {
    return this.fileSubject.asObservable();
  }

  get currentFile(): File | null {
    return this.fileSubject.value;
  }

  clear(): void {
    this.fileSubject.next(null);
  }
}