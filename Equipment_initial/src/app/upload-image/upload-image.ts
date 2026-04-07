import { ChangeDetectorRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from "@angular/common"
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';



interface uploadedFiles {
  name: string;
  type: string;
  size: number;
  content?: string | ArrayBuffer | null;
  fullFile: File;
}

@Component({
  selector: 'app-upload-image',
  imports: [MatCardModule, DecimalPipe, MatGridListModule, MatButtonModule],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.css',
})


export class UploadImage {
  imageSrc: string | ArrayBuffer | null = null;
  filesInput: uploadedFiles[] = [];
  allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  constructor(private readonly cd: ChangeDetectorRef) { }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    // Clear the image preview and extraction results
    // this.filesInput = []; //Clear previous files

    // Check if a file was selected
    if (input.files && input.files.length > 0) {
      // Load a preview of images for the user
      const maxSizeMB = 10;

      Array.from(input.files).forEach(file => {
        const reader = new FileReader();

        reader.onload = () => {
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > maxSizeMB) {
            console.log("${file.name} is too big of a file. Skipping file.");
            alert(file.name + " is too big of a file. Skipping file.");
          }
          else if (!this.allowedTypes.includes(file.type)) {
            alert(file.name + "is an invalid file type. Skipping file");
            return;
          }
          else {
            // make sure that you don't add any duplicate files (maybe remove if causes to much latency)
            if (this.filesInput.find(files => files.name === file.name)) {
              console.log("Duplicate file skipped", file.name);
            } else {
              this.filesInput.push({
                name: file.name,
                type: file.type,
                size: file.size,
                content: reader.result,
                fullFile: file
              });
              console.log('File added:', file.name);
            }
          }
          this.cd.detectChanges();
        };
        reader.onerror = () => {
          console.error('Error reading file: ${file.name}');
          throw ("Error reading file: ${file.name}");
        };
        // Read as Data URL
        reader.readAsDataURL(file);
      });
    } else {
      this.filesInput = [];
      this.cd.detectChanges();
    }
  }
}
