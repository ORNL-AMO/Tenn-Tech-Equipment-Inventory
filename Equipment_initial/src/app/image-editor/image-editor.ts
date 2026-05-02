import { Component, ViewChild, ElementRef, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.html',
  styleUrls: ['./image-editor.css'],
  standalone: true,
  imports: [MatIconModule, MatButtonModule]
})
export class ImageEditorComponent implements AfterViewInit {
  public dialogRef = inject(MatDialogRef<ImageEditorComponent>);
  public data = inject(MAT_DIALOG_DATA) as { image: string, name: string };
  private cdr = inject(ChangeDetectorRef); 

  @ViewChild('imageAsset') imageElement!: ElementRef<HTMLImageElement>;
  
  cropper!: any;
  currentAngle = 0;
  zoomLevel = 100;
  baseRatio = 1; // <--- Fit to screen baseline

  // Sets up the crop tool once the picture is on the screen
  ngAfterViewInit() {
    const options: any = {
      viewMode: 0,
      autoCropArea: 0.9,
      responsive: true,
      
      // Wait for Cropper to finish shrinking the image to fit the screen
      ready: () => {
        // Divide the canvas width by the actual image width
        const canvasData = this.cropper.getCanvasData();
        this.baseRatio = canvasData.width / canvasData.naturalWidth;
      },
      
      zoom: (event: any) => {
        // Calculate the scale based off that initial fit
        const currentUiPercentage = (event.detail.ratio / this.baseRatio) * 100;

        // Stops the mouse wheel from zooming past 1000%
        if (currentUiPercentage > 1000) {
          event.preventDefault(); 
          this.cropper.zoomTo(this.baseRatio * 10);
          this.zoomLevel = 1000;
        } else {
          this.zoomLevel = Math.round(currentUiPercentage);
        }
        this.cdr.detectChanges(); 
      }
    };

    this.cropper = new Cropper(this.imageElement.nativeElement, options);
  }

  // Keeps the rotation numbers cleanly between 0 and 359
  private normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }

  // Nudges the picture by a few degrees
  adjustAngle(delta: number) {
    this.currentAngle = this.normalizeAngle(this.currentAngle + delta);
    this.cropper.rotateTo(this.currentAngle);
  }

  // Snaps the picture by full 90-degree turns
  handleHardRotate(deg: number) {
    this.currentAngle = this.normalizeAngle(this.currentAngle + deg);
    this.cropper.rotateTo(this.currentAngle);
  }

  // Turns the picture to match the slider exactly
  manualRotate(event: any) {
    this.currentAngle = Number(event.target.value);
    this.cropper.rotateTo(this.currentAngle);
  }

  // Steps the zoom in or out by a flat 10%
  handleZoom(delta: number) {
    let newZoomPercent = this.zoomLevel + (delta * 100);

    if (newZoomPercent > 1000) {
        newZoomPercent = 1000;
    } else if (newZoomPercent < 10) {
        newZoomPercent = 10;
    }

    // Multiply our slider percentage by the base ratio
    this.cropper.zoomTo(this.baseRatio * (newZoomPercent / 100));
    this.zoomLevel = newZoomPercent;
  }

  // Sets the zoom to match the slider exactly
  manualZoom(event: any) {
    let newZoomPercent = Number(event.target.value);
    
    if (newZoomPercent > 1000) {
        newZoomPercent = 1000;
    }

    // Multiply slider percentage by the base ratio
    this.cropper.zoomTo(this.baseRatio * (newZoomPercent / 100));
    this.zoomLevel = newZoomPercent;
  }

  // Crops the picture and sends it back to the main screen
  save() {
    const canvas = this.cropper.getCroppedCanvas();
    if (canvas) {
        const editedBase64 = canvas.toDataURL('image/jpeg', 0.9);
        this.dialogRef.close(editedBase64);
    }
  }

  // Closes the window without saving anything
  close() {
    this.dialogRef.close();
  }
}