import { Component, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-upload-image',
  imports: [MatCardModule],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css',
})


export class UploadImage {
  fileAdded = output<Event>();
  selectFile(event: Event) {
    this.fileAdded.emit(event);
  }
}