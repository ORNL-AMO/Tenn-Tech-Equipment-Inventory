import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { uploadedFiles } from '../motor-data.model';

interface ImagePreviewDialogData {
    getFiles: () => uploadedFiles[];
    clearPreview: () => void;
    deletePreviewItem: (file: File) => void;
    openEditor: (file: uploadedFiles) => void;
    openNextStep: () => void;
    scanImages: () => Promise<boolean>;
    getScanProgress: () => number;
}

@Component({
    selector: 'app-image-preview-dialog',
    templateUrl: './image-preview-dialog.html',
    styleUrls: ['./image-preview-dialog.css'],
    standalone: true,
    imports: [DecimalPipe, MatButtonModule, MatGridListModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule]
})
export class ImagePreviewDialogComponent {
    private dialogRef = inject(MatDialogRef<ImagePreviewDialogComponent>);
    data = inject<ImagePreviewDialogData>(MAT_DIALOG_DATA);
    files = this.data.getFiles();
    scanning = false;
    scanProgress = 0;
    private progressTimer?: ReturnType<typeof setInterval>;

    refresh(): void {
        this.files = this.data.getFiles();
        if (this.files.length === 0) {
            this.dialogRef.close();
        }
    }

    deleteFile(file: uploadedFiles): void {
        if (this.scanning) return;
        this.data.deletePreviewItem(file.fullFile);
        this.refresh();
    }

    clearPreview(): void {
        if (this.scanning) return;
        this.data.clearPreview();
        this.refresh();
    }

    openEditor(file: uploadedFiles): void {
        if (this.scanning) return;
        this.data.openEditor(file);
    }

    async scanImages(): Promise<void> {
        if (this.scanning) return;

        this.scanning = true;
        this.scanProgress = 0;
        this.progressTimer = setInterval(() => {
            this.scanProgress = this.data.getScanProgress();
        }, 100);

        try {
            const scanned = await this.data.scanImages();
            this.scanProgress = this.data.getScanProgress();
            if (scanned) {
                this.dialogRef.close();
                this.data.openNextStep();
            }
        } finally {
            if (this.progressTimer) {
                clearInterval(this.progressTimer);
                this.progressTimer = undefined;
            }
            this.scanning = false;
        }
    }

    close(): void {
        if (this.scanning) return;
        this.dialogRef.close();
    }
}
