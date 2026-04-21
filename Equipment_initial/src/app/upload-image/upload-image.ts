import { Component, inject, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { HelpButtonDialog } from '../help-button/help-button';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileInputDirective } from '@ngx-dropzone/cdk';
import { MatChipRow } from '@angular/material/chips';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatDropzone } from '@ngx-dropzone/material'

@Component({
  selector: 'app-upload-image',
  imports: [
    MatCardModule,
    MatIcon,
    ReactiveFormsModule,
    FileInputDirective,
    MatDropzone,
    ReactiveFormsModule,
    MatChipRow,
    MatError,
    MatFormField,
    MatLabel
  ],
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
  profileImg = new FormControl();
  
  

  get images() {
    const images = this.profileImg.value;
    this.fileAdded.emit(images);

    if (!images) return [];
    return Array.isArray(images) ? images : [images];
  }

  remove(image: File) {
    if (Array.isArray(this.profileImg.value)) {
      this.profileImg.setValue(this.profileImg.value.filter((i) => i !== image));
      return;
    }

    this.profileImg.setValue(null);
  }
}