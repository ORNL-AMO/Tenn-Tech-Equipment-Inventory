import { Component } from '@angular/core';
import * as extraction from "../../scripts/extraction";

@Component({
  selector: 'app-upload-image',
  imports: [],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css'
})

export class UploadImage {
  processImg() {
    extraction.processImage()
  }
}
