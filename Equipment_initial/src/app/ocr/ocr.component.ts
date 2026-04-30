import { Component, inject, ChangeDetectorRef, NgZone, output } from "@angular/core";
import { OCRService } from "./ocr";
import { ImageUtils } from "./image-utils";
import { NormalizeTextPipe } from "./normalize-text-pipe";
import { UploadImage } from "../upload-image/upload-image";
import { Webcam } from '../webcam/webcam';
import { FormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TextExtractorService } from "./text-extractor.service";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from '../inventory/inventory.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { GenericErrorDialog } from "../error.dialog";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ImageEditorComponent } from '../image-editor/image-editor';
import { ImagePreviewDialogComponent } from './image-preview-dialog';
import { InventoryReviewDialogComponent } from './inventory-review-dialog';
import { MotorConverterService } from "./motor-converter";
import { motorData, uploadedFiles } from '../motor-data.model';


@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    styleUrls: ['./ocr.component.css'],
    imports: [UploadImage, Webcam, MatProgressBarModule, MatButtonToggleModule, MatPaginatorModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatDividerModule, MatInputModule, FormsModule, MatInputModule, MatFormFieldModule, MatCheckboxModule, MatMenuModule]
})
export class OCRComponent {
    private dialog = inject(MatDialog);
    private converter = inject(MotorConverterService);
    private zone = inject(NgZone);
    inventoryReviewCompleted = output<void>();
    pageOver: number = 1;
    currentPage: number = 0;
    inputType: String = 'Camera';
    inventory: motorData[] = [];
    imageSrc: string | ArrayBuffer | null = null;
    filesInput: uploadedFiles[] = [];
    loading: boolean = false;
    extractionProgress = 0;
    private imageUtils = inject(ImageUtils);
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    private _snackBar = inject(MatSnackBar)
    fileRemove: File | undefined = undefined
    private previewDialogRef?: MatDialogRef<ImagePreviewDialogComponent>;
    private inventoryReviewDialogRef?: MatDialogRef<InventoryReviewDialogComponent>;

    readonly saveSelectableFields = [
        'name', 'result', 'description',
        'CAT_NO', 'SPEC', 'HORSEPOWER', 'VOLTAGE', 'AMPERAGE', 'RPM',
        'FRAME', 'HERTZ', 'PH', 'SER_F', 'CODE', 'DES', 'CLASS',
        'NEMA_NOM_EFF', 'P_F', 'RATING', 'CC', 'USABLE_AT',
        'BEARINGS_DE', 'BEARINGS_ODE', 'ENCL', 'SERIAL_NUMBER'
    ];

    // Field selection for save filtering
    selectedFields: Set<string> = new Set(this.saveSelectableFields);
    allFieldsSelected: boolean = true;

    constructor(private ocr: OCRService,
        private readonly cd: ChangeDetectorRef,
        private textExtractor: TextExtractorService,
        private inventoryService: InventoryService) { }


    switchPage(e: PageEvent) {
        this.currentPage = e.pageIndex * e.pageSize;
        this.pageOver = this.currentPage + e.pageSize;
        this.cd.detectChanges();
    }

    saveItemToInventory(item: motorData): void {
        if (item.savedToInventory) {
            this._snackBar.open(`"${item.name}" is already saved`, "Ok", { duration: 3000 });
            return;
        }

        // Filter out unselected fields by setting them to undefined
        const filteredItem = { ...item };
        this.saveSelectableFields.forEach(field => {
            if (!this.selectedFields.has(field)) {
                (filteredItem as any)[field] = undefined;
            }
        });

        this.inventoryService.saveItem(filteredItem as any);
        item.savedToInventory = true;
        this.inventory = this.inventory.filter(saved => saved !== item);
        this.cd.detectChanges();
        this._snackBar.open(`Saved "${item.name}" to inventory`, "Ok", { duration: 3000 });
    }


    async onFileSelected(event: Event | { target: { files: File[] } }): Promise<void> {
        const input = event.target as HTMLInputElement;
        // Clear the image preview and extraction results
        // this.filesInput = []; //Clear previous files

        // Check if a file was selected
        if (input.files && input.files.length > 0) {
            // Load a preview of images for the user
            const maxSizeMB = 10;

            Array.from(input.files).forEach(file => {
                const reader = new FileReader();
                // Read as Data URL
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const fileSizeMB = file.size / (1024 * 1024);
                    if (fileSizeMB > maxSizeMB) {
                        console.log("${file.name} is too big of a file. Skipping file.");
                        this.dialog.open(GenericErrorDialog, {
                            data: {
                                title: 'File Too Large',
                                message: file.name + " is too big of a file. Skipping file."
                            }
                        });
                    }
                    else if (!this.allowedTypes.includes(file.type)) {
                        this.dialog.open(GenericErrorDialog, {
                            data: {
                                title: 'Invalid File Type',
                                message: file.name + " is an invalid file type. Skipping file."
                            }
                        });
                        return;
                    }
                    else {
                        // make sure that you don't add any duplicate files (maybe remove if causes to much latency)
                        if (this.filesInput.find(files => files.content === reader.result)) {
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
                            this.openPreviewDialog();
                        }
                    }
                    this.cd.detectChanges();
                    this.previewDialogRef?.componentInstance.refresh();
                };
                reader.onerror = () => {
                    console.error('Error reading file: ${file.name}');
                    throw ("Error reading file: ${file.name}");
                };
            });
        } else {
            this.cd.detectChanges();
        }
    }

    deletePreviewItem(deleteThis: File, refreshDialog = true) {
        this.fileRemove = this.filesInput.find(saved => saved.fullFile === deleteThis)?.fullFile
        this.filesInput = this.filesInput.filter(saved => saved.fullFile !== deleteThis);
        this.cd.detectChanges();
        if (refreshDialog) {
            this.previewDialogRef?.componentInstance.refresh();
        }
    }

    clearPreview() {
        this.filesInput.forEach(item => {
            this.deletePreviewItem(item.fullFile, false)
        })
        this.filesInput = [];
        this.cd.detectChanges();
        this.previewDialogRef?.close();
    }

    openPreviewDialog(): void {
        if (this.previewDialogRef) {
            this.previewDialogRef.componentInstance.refresh();
            return;
        }

        this.previewDialogRef = this.dialog.open(ImagePreviewDialogComponent, {
            data: {
                getFiles: () => this.filesInput,
                clearPreview: () => this.clearPreview(),
                deletePreviewItem: (file: File) => this.deletePreviewItem(file),
                openEditor: (file: uploadedFiles) => this.openEditor(file),
                openNextStep: () => this.openInventoryReviewDialog(),
                scanImages: () => this.onUpload(),
                getScanProgress: () => this.extractionProgress
            },
            width: '92vw',
            height: '82vh',
            maxWidth: '100vw',
            panelClass: 'image-preview-dialog-panel'
        });

        this.previewDialogRef.afterClosed().subscribe(() => {
            this.previewDialogRef = undefined;
        });
    }

    openInventoryReviewDialog(): void {
        if (this.inventoryReviewDialogRef) {
            return;
        }

        this.inventoryReviewDialogRef = this.dialog.open(InventoryReviewDialogComponent, {
            data: {
                openPreviousStep: () => this.openPreviewDialog(),
                getInventory: () => this.inventory,
                clearInventory: () => this.clearInventory(),
                deleteInventoryItem: (id: string | undefined) => this.deleteInventoryItem(id),
                saveItemToInventory: (item: motorData) => this.saveItemToInventory(item),
                toggleField: (fieldName: string) => this.toggleField(fieldName),
                toggleAllFields: () => this.toggleAllFields(),
                isFieldSelected: (fieldName: string) => this.isFieldSelected(fieldName),
                areAllFieldsSelected: () => this.allFieldsSelected,
                openInventoryTab: () => this.inventoryReviewCompleted.emit()
            },
            width: '92vw',
            height: '82vh',
            maxWidth: '100vw',
            panelClass: 'inventory-review-dialog-panel'
        });

        this.inventoryReviewDialogRef.afterClosed().subscribe(() => {
            this.inventoryReviewDialogRef = undefined;
        });
    }


    async onUpload(): Promise<boolean> {
        // No file selected, let the user know and stop
        if (!(this.filesInput.length > 0)) {
            console.error('No Files Imported');
            this.dialog.open(GenericErrorDialog, {
                data: {
                    title: 'No Files Selected',
                    message: "Please select a file or picture to process."
                }
            });
            return false;
        }
        this.zone.run(() => {
            this.loading = true;
            this.cd.detectChanges();
        });
        try {
            for (let i = 0; i < this.filesInput.length; i++) {
                this.zone.run(() => this.cd.detectChanges());
                const file = this.filesInput[i];
                try {
                    const canvas = await this.imageUtils.prepareImage(file.fullFile);
                    const text = await this.ocr.extractText(canvas, file.name);
                    const description = new NormalizeTextPipe().transform(text);
                    const extractedValues = await this.textExtractor.extractValues(description);

                    let finalHorsepower = extractedValues.HORSEPOWER;

                    if (!finalHorsepower && extractedValues.KILOWATTS) {
                        const calculatedHp = this.converter.kwToHp(extractedValues.KILOWATTS);
                        if (calculatedHp) finalHorsepower = calculatedHp.toFixed(2); 
                    } else if (!finalHorsepower && extractedValues.WATTS) {
                        const calculatedHp = this.converter.wattsToHp(extractedValues.WATTS);
                        if (calculatedHp) finalHorsepower = calculatedHp.toFixed(2);
                    }

                    let finalEff = extractedValues.NEMA_NOM_EFF;
                    if (finalEff) {
                        const effNum = parseFloat(finalEff);
                        if (!isNaN(effNum) && effNum > 0 && effNum < 1) {
                            finalEff = (effNum * 100).toFixed(1);
                        }
                    }

                    let finalPf = extractedValues.P_F;
                    if (finalPf) {
                        const pfNum = parseFloat(finalPf);
                        if (!isNaN(pfNum) && pfNum > 0 && pfNum < 1) {
                            finalPf = (pfNum * 100).toFixed(1);
                        }
                    }

                    const motor: motorData = {
                        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
                        name: file.name,
                        result: text,
                        description,
                        image: typeof file.content === 'string' ? file.content : undefined,
                        savedAt: new Date().toLocaleString(),
                        savedToInventory: false,
                        CAT_NO: extractedValues.CAT_NO,
                        SPEC: extractedValues.SPEC,
                        HORSEPOWER: finalHorsepower,
   
                        VOLTAGE: extractedValues.VOLTAGE,
                        AMPERAGE: extractedValues.AMPERAGE,
                        RPM: extractedValues.RPM,
                        FRAME: extractedValues.FRAME,
                        HERTZ: extractedValues.HERTZ,
                        PH: extractedValues.PH,
                        SER_F: extractedValues.SER_F,
                        CODE: extractedValues.CODE,
                        DES: extractedValues.DES,
                        CLASS: extractedValues.CLASS,
                        NEMA_NOM_EFF: finalEff,
                        P_F: finalPf,
                        RATING: extractedValues.RATING,
                        CC: extractedValues.CC,
                        USABLE_AT: extractedValues.USABLE_AT,
                        BEARINGS_DE: extractedValues.BEARINGS_DE,
                        BEARINGS_ODE: extractedValues.BEARINGS_ODE,
                        ENCL: extractedValues.ENCL,
                        SERIAL_NUMBER: extractedValues.SERIAL_NUMBER
                    };
                    this.zone.run(() => {
                        this.inventory.push(motor);
                        this.cd.detectChanges();
                    });

                } catch (err: any) {
                    console.warn(`Skipping ${file.name}`, err);
                    this.zone.run(() => {
                        this.dialog.open(GenericErrorDialog, {
                            data: {
                                title: 'An Error Occurred',
                                message: `Error processing file ${file.name}. Skipping file.`
                            }
                        });
                    });
                }
                this.zone.run(() => {
                    this.extractionProgress = ((i + 1) / this.filesInput.length) * 100;
                    this.cd.detectChanges();
                });
            }

        } catch (error) {
            console.error('Unexpected batch error:', error);
            return false;
        } finally {
            this.zone.run(() => {
                this.loading = false;
                this.extractionProgress = 0;
                this.cd.detectChanges();
                this._snackBar.open("All Files Processed", "Ok", { duration: 5000 });
            });
        }

        return true;
    }


    deleteInventoryItem(deleteId: string | undefined) {
        this.inventory = this.inventory.filter(saved => saved.id !== deleteId);
        this.cd.detectChanges();
    }

    clearInventory() {
        this.inventory = [];
        this.cd.detectChanges();
    }


    toggleField(fieldName: string): void {
        if (this.selectedFields.has(fieldName)) {
            this.selectedFields.delete(fieldName);
        } else {
            this.selectedFields.add(fieldName);
        }
        this.updateAllFieldsSelected();
    }

    toggleAllFields(): void {
        if (this.allFieldsSelected) {
            this.selectedFields.clear();
        } else {
            this.saveSelectableFields.forEach(field => this.selectedFields.add(field));
        }
        this.allFieldsSelected = !this.allFieldsSelected;
    }

    updateAllFieldsSelected(): void {
        this.allFieldsSelected = this.saveSelectableFields.every(field => this.selectedFields.has(field));
    }

    isFieldSelected(fieldName: string): boolean {
        return this.selectedFields.has(fieldName);
    }

    openEditor(file: uploadedFiles) {
        // We assume the ImageEditorDialogComponent is imported at the top
        const dialogRef = this.dialog.open(ImageEditorComponent, {
            data: {
                image: file.content,
                name: file.name
            },
            width: '95vw',
            height: '90vh',
            maxWidth: '100vw'
        });

        dialogRef.afterClosed().subscribe((editedBase64: string) => {
            if (editedBase64) {

                file.content = editedBase64;

                const blob = this.dataURItoBlob(editedBase64);
                file.fullFile = new File([blob], file.name, { type: 'image/jpeg' });

                this.cd.detectChanges();
                this._snackBar.open(`Applied edits to ${file.name}`, "Ok", { duration: 2000 });
            }
        });
    }

    private dataURItoBlob(dataURI: string): Blob {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }
}
