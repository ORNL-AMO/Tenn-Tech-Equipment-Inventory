import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { Header } from './header/header';
import { UploadImage } from './upload-image/upload-image';
import { Webcam } from './webcam/webcam';
import { History } from './history/history';
import { OCRComponent } from './ocr/ocr.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OCRComponent, MatTabsModule, Header, UploadImage, Webcam, History],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('MEASUR Proof of Concept');
}
