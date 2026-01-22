import { Component, signal } from '@angular/core';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { UploadImage } from './upload-image/upload-image';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, UploadImage, WebcamModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('MEASUR Proof of Concept');
  public webcamImage: WebcamImage = null;
  private trigger: Subject<void> = new Subject<void>();

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    console.info('Captured image:', webcamImage);
    this.webcamImage = webcamImage;
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
}
