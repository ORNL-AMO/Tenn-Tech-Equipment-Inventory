import { Component } from '@angular/core';
import { OCRComponent } from '../ocr/ocr.component';

@Component({
  selector: 'app-upload-image',
  imports: [OCRComponent],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css'
})

export class UploadImage {
}
