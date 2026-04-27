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
  private cdr = inject(ChangeDetectorRef); // Tells Angular to update the UI

  @ViewChild('imageAsset') imageElement!: ElementRef<HTMLImageElement>;
  
  cropper!: any;
  currentAngle = 0;
  zoomLevel = 100;

  ngAfterViewInit() {
    const options: any = {
      viewMode: 0,
      autoCropArea: 0.9,
      responsive: true,
      zoom: (event: any) => {
        // Updates the zoom number when you use the mouse wheel
        this.zoomLevel = Math.round(event.detail.ratio * 100);
        this.cdr.detectChanges(); 
      }
    };

    this.cropper = new Cropper(this.imageElement.nativeElement, options);
  }

  // Ensures angles stay within a clean 0-359 range
  private normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }

  adjustAngle(delta: number) {
    this.currentAngle = this.normalizeAngle(this.currentAngle + delta);
    this.cropper.rotateTo(this.currentAngle);
  }

  handleHardRotate(deg: number) {
    this.currentAngle = this.normalizeAngle(this.currentAngle + deg);
    this.cropper.rotateTo(this.currentAngle);
  }

  manualRotate(event: any) {
    this.currentAngle = Number(event.target.value);
    this.cropper.rotateTo(this.currentAngle);
  }

  handleZoom(delta: number) {
    this.cropper.zoom(delta);
  }

  manualZoom(event: any) {
    const newZoomPercent = Number(event.target.value);
    this.cropper.zoomTo(newZoomPercent / 100);
    this.zoomLevel = newZoomPercent;
  }

  save() {
    const canvas = this.cropper.getCroppedCanvas();
    if (canvas) {
        const editedBase64 = canvas.toDataURL('image/jpeg', 0.9);
        this.dialogRef.close(editedBase64);
    }
  }

  close() {
    this.dialogRef.close();
  }
}