import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { UploadImage } from './upload-image/upload-image';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, UploadImage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('MEASUR Proof of Concept');
}
