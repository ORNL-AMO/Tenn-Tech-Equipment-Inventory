import { ChangeDetectorRef, Component, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { HelpButtonDialog } from '../help-button/help-button';
import { Examples } from '../examples/examples'
import { MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileInputDirective } from '@ngx-dropzone/cdk';
import { MatChipRow } from '@angular/material/chips';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatDropzone } from '@ngx-dropzone/material'
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-upload-image',
  imports: [
    MatIcon,
    ReactiveFormsModule,
    FileInputDirective,
    MatDropzone,
    ReactiveFormsModule,
    MatChipRow,
    MatError,
    MatFormField,
    MatLabel,
    MatButtonModule
  ],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css',
})

export class UploadImage {
  constructor(private readonly cd: ChangeDetectorRef) { }
  fileAdded = output<Event | { target: { files: File[] } }>();
  readonly dialog = inject(MatDialog);
  openHelpDialog() {
    this.dialog.open(HelpButtonDialog);
  }
  openExampleDialog() {
    this.dialog.open(Examples)
  }
  profileImg = new FormControl();

  onControlChange() {
    // 1 ms delay to allow the FormControl to update first, then emit the file(s)
    setTimeout(() => {
    this.fileAdded.emit({ target: { files: this.profileImg.value } })
    this.cd.detectChanges();
    }, 1);
  }

  get images() {
    const images = this.profileImg.value;

    if (!images) return [];
    return Array.isArray(images) ? images : [images];
  }
}