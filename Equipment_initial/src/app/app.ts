import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { UploadImage } from './upload-image/upload-image';
import { Webcam } from './webcam/webcam';
import { OCRComponent } from './ocr/ocr.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, UploadImage, Webcam, OCRComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('MEASUR Proof of Concept');
}
