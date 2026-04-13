import { Component, inject, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { HelpButtonDialog } from '../help-button/help-button';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-upload-image',
  imports: [MatCardModule, MatIcon],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css',
})

export class UploadImage {
  fileAdded = output<Event>();
  selectFile(event: Event) {
    this.fileAdded.emit(event);
  }
  readonly dialog = inject(MatDialog);
  openHelpDialog() {
    const helpDialog = this.dialog.open(HelpButtonDialog);
  }
}