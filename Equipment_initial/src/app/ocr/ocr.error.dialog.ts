// import Swal from 'sweetalert2';
import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
@Component({
    selector: 'ocr-warning-dialog',
    template: `
    <h2 mat-dialog-title>Low Confidence Read</h2>

    <mat-dialog-content>
      <div class="text-start">
        <p class="mb-2">
          We struggled to read this image: <strong>{{ data.name }}</strong>.
          Make sure the photo is clear, well lit, and upright.
          Here is a preview of what it salvaged:
        </p>

        <pre
          class="bg-light p-2 border rounded text-muted"
          style="font-size: 0.8rem; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">
{{ data.preview }}
        </pre>

        <p class="mb-0 mt-2 fw-bold">
          Do you want to keep this partial text?
        </p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="discard()">Discard</button>
      <button mat-button color="primary" (click)="keep()">Keep it</button>
    </mat-dialog-actions>
  `,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule
    ],
})
export class OcrWarningDialog {
    readonly dialogRef = inject(MatDialogRef<OcrWarningDialog>);
    readonly data = inject<{ name: string; preview: string }>(MAT_DIALOG_DATA);

    keep() {
        this.dialogRef.close('keep');
    }

    discard() {
        this.dialogRef.close('discard');
    }
}

@Component({
    selector: 'ocr-error-dialog',
    template: `
    <h2 mat-dialog-title>OCR Failed</h2>

    <mat-dialog-content>
      <p>OCR failed with no salvageable text</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close (click)="close()">OK</button>
    </mat-dialog-actions>
  `,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule],
})
export class OcrErrorDialog { 
    readonly dialogRef = inject(MatDialogRef<OcrErrorDialog>);
    close() {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'ocr-generic-error-dialog',
    template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close (click)="close()">OK</button>
    </mat-dialog-actions>
  `,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule
    ],
})
export class OcrGenericErrorDialog {
    readonly dialogRef = inject(MatDialogRef<OcrGenericErrorDialog>);
    readonly data = inject<{ title: string; message: string }>(MAT_DIALOG_DATA);

    close() {
        this.dialogRef.close();
    }
}
