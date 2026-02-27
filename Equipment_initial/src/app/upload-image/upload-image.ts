import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OCRComponent } from '../ocr/ocr.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-upload-image',
  imports: [OCRComponent, MatCardModule],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UploadImage {
}
