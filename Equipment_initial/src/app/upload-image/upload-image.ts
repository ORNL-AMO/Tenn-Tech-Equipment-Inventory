// Functional imports
import { ChangeDetectorRef, Component, inject, output, effect, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileInputDirective } from '@ngx-dropzone/cdk';

// Dialog imports
import { HelpButtonDialog } from '../help-button/help-button';
import { Examples } from '../examples/examples'

// Material imports
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
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
  styleUrls: ['./upload-image.css'],
})

export class UploadImage {
  // output to emit whenever new file(s) are uploaded
  fileAdded = output<Event | { target: { files: File[] } }>();
  // input that is used to remove the file names from the matChip list (makes nicer for user)
  fileRemoved = input<File | undefined>(undefined);

  constructor(private readonly cd: ChangeDetectorRef) {

    // This calls the remove function if the removedFile input is updated
    effect(() => {
      const removedFile = this.fileRemoved();
      if (removedFile) {
        this.remove(removedFile);
      }
    });
   }

  // Dialog injection for pop-ups
  readonly dialog = inject(MatDialog);

  // Call to pop-up the help box
  openHelpDialog() {
    this.dialog.open(HelpButtonDialog);
  }
  // Call to pop-up the example box
  openExampleDialog() {
    this.dialog.open(Examples)
  }
  
  uploadedFiles = new FormControl();

  // Call when the file list changes to pass the new files up to ocr.component
  onControlChange() {
    // 1 ms delay to allow the FormControl to update first, then emit the file(s)
    setTimeout(() => {
      this.fileAdded.emit({ target: { files: this.uploadedFiles.value } })
      this.cd.detectChanges();
    }, 1);
  }

  // get for the formControl uploadedFiles
  get images() {
    const images = this.uploadedFiles.value;

    if (!images) return [];
    return Array.isArray(images) ? images : [images];
  }

  // Remove for the formControl uploadedFiles
  remove(image: File | undefined) {
    if (Array.isArray(this.uploadedFiles.value)) {
      this.uploadedFiles.setValue(this.uploadedFiles.value.filter((i: File) => i !== image));
      return;
    }

    this.uploadedFiles.setValue(null);
    this.cd.detectChanges();
  }
}
