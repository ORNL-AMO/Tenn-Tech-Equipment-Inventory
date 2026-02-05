import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OCRComponent } from '../ocr/ocr.component';

@Component({
  selector: 'app-upload-image',
  imports: [CommonModule, OCRComponent],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css'
})

export class UploadImage {
}
