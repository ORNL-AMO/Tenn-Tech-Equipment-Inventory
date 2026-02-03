import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePasser } from '../image-passer';
import { filter, take} from 'rxjs/operators'
import { firstValueFrom } from 'rxjs';
// import * as extraction from "../../scripts/extraction";

@Component({
  selector: 'app-upload-image',
  imports: [CommonModule],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css'
})

export class UploadImage {
  constructor(private imagePasser: ImagePasser) {}
 
  async waitForCaptureThenUpload(): Promise<void> {
  const blob = await firstValueFrom(
    this.imagePasser.blob$().pipe(
      filter((b): b is Blob => b !== null),
      take(1)
    )
  );
 
}
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
