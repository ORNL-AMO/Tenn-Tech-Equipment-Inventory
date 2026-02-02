import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OCRComponent } from '../ocr/ocr.component';
// import * as extraction from "../../scripts/extraction";

@Component({
  selector: 'app-upload-image',
  imports: [CommonModule, OCRComponent],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css'
})

export class UploadImage {
  hasClickedButton: boolean = false;
  processImg(): void {
    // extraction.processImage()
    if (this.hasClickedButton) {
      this.hasClickedButton = false;
    } else {
      this.hasClickedButton = true;
    }
  }
}
