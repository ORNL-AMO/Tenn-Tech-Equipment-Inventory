import { Component, inject, ChangeDetectorRef, input } from "@angular/core";
import { OCRService } from "./ocr";
import { ImageUtils } from "./image-utils";
import { NormalizeTextPipe } from "./normalize-text-pipe";
import { ImagePasser } from "../image-passer";
import { UploadImage } from "../upload-image/upload-image";
import { DecimalPipe } from "@angular/common"
import { FormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TextExtractorService } from "./text-extractor.service";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HistoryService } from '../history/history.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';


interface uploadedFiles {
    name: string;
    type: string;
    size: number;
    content?: string | ArrayBuffer | null;
    fullFile: File;
}

interface motorData {
    id?: string;
    name: string;
    result: string;
    description: string;
    image?: string;
    savedAt?: string;
    CAT_NO: string | undefined;
    SPEC: string | undefined;
    HORSEPOWER: string | undefined;
    VOLTAGE: string | undefined;
    AMPERAGE: string | undefined;
    RPM: string | undefined;
    FRAME: string | undefined;
    HERTZ: string | undefined;
    PH: string | undefined;
    SER_F: string | undefined;
    CODE: string | undefined;
    DES: string | undefined;
    CLASS: string | undefined;
    NEMA_NOM_EFF: string | undefined;
    P_F: string | undefined;
    RATING: string | undefined;
    CC: string | undefined;
    USABLE_AT: string | undefined;
    BEARINGS_DE: string | undefined;
    BEARINGS_ODE: string | undefined;
    ENCL: string | undefined;
    SERIAL_NUMBER: string | undefined;
}

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    styleUrl: './ocr.component.css',
    imports: [DecimalPipe, UploadImage, MatProgressBarModule, MatButtonToggleModule, MatPaginatorModule, MatIconModule, MatProgressSpinnerModule, MatGridListModule, MatButtonModule, MatDividerModule, MatInputModule, FormsModule, MatInputModule, MatFormFieldModule, MatCheckboxModule, MatMenuModule]
})
export class OCRComponent {
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

    // Field selection for save filtering
    selectedFields: Set<string> = new Set([
        'name', 'result', 'description',
        'CAT_NO', 'SPEC', 'HORSEPOWER', 'VOLTAGE', 'AMPERAGE', 'RPM',
        'FRAME', 'HERTZ', 'PH', 'SER_F', 'CODE', 'DES', 'CLASS',
        'NEMA_NOM_EFF', 'P_F', 'RATING', 'CC', 'USABLE_AT',
        'BEARINGS_DE', 'BEARINGS_ODE', 'ENCL', 'SERIAL_NUMBER'
    ]);
    allFieldsSelected: boolean = true;

    constructor(private ocr: OCRService,
        private readonly cd: ChangeDetectorRef,
        private imagePasser: ImagePasser,
        private textExtractor: TextExtractorService,
        private historyService: HistoryService) { }


    switchPage(e: PageEvent) {
        this.currentPage = e.pageIndex * e.pageSize;
        this.pageOver = this.currentPage + e.pageSize;
        this.cd.detectChanges();
    }

    saveItem(item: motorData): void {
        // Filter out unselected fields by setting them to undefined
        const filteredItem = { ...item };
        const fieldsToCheck = [
            'CAT_NO', 'SPEC', 'HORSEPOWER', 'VOLTAGE', 'AMPERAGE', 'RPM',
            'FRAME', 'HERTZ', 'PH', 'SER_F', 'CODE', 'DES', 'CLASS',
            'NEMA_NOM_EFF', 'P_F', 'RATING', 'CC', 'USABLE_AT',
            'BEARINGS_DE', 'BEARINGS_ODE', 'ENCL', 'SERIAL_NUMBER'
        ];

        fieldsToCheck.forEach(field => {
            if (!this.selectedFields.has(field)) {
                (filteredItem as any)[field] = undefined;
            }
        });

        this.historyService.saveItem(filteredItem as any);
        this._snackBar.open(`Saved "${item.name}" to history`, "Ok", { duration: 5000 });
    }

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
                // Read as Data URL
                reader.readAsDataURL(file);
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
            });
        } else {
            this.cd.detectChanges();
        }
    }

    async onUpload(): Promise<void> {
        this.inventory = [];
        // No file selected, let the user know and stop
        if (!(this.filesInput.length > 0) && this.inputType == "Files") {
            console.error('No File Selected');
            alert("Please select a file to process")
            return;
        } else if (!this.imagePasser.currentFile && this.inputType == "Camera") {
            console.error('No capture available');
            alert("No Image captured from camera");
            return;
        }
        this.loading = true;
        if (this.inputType == "Both") {
            //add ability to do both here!!!
        } else if (this.inputType == "Camera") { //use camera
            if (!this.imagePasser.currentFile) {
                this.loading = false;
                return;
            }
            try {
                // Show the extracting message and begin processing
                this.loading = true;
                console.log("Loading = " + this.loading);
                // Preprocess and do OCR on an image passed from another component, if it exists
                console.log("File being sent to prepareImage:", this.imagePasser.currentFile!);
                console.log("Type:", typeof this.imagePasser.currentFile!);
                console.log("Instanceof File:", this.imagePasser.currentFile! instanceof File);
                const canvas = await this.imageUtils.prepareImage(this.imagePasser.currentFile!);
                const imageData = canvas.toDataURL('image/png');
                const result = await this.ocr.extractText(canvas, "Camera Input");
                const description = new NormalizeTextPipe().transform(result);
                const extractedValues = await this.textExtractor.extractValues(description);
                // Populate developer fields so it's easy to see where to edit                
                const motor: motorData = {
                    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
                    name: "Camera input",
                    result: result,
                    description: description,
                    image: imageData,
                    savedAt: new Date().toLocaleString(),
                    CAT_NO: extractedValues.CAT_NO,
                    SPEC: extractedValues.SPEC,
                    HORSEPOWER: extractedValues.HORSEPOWER,
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
                    NEMA_NOM_EFF: extractedValues.NEMA_NOM_EFF,
                    P_F: extractedValues.P_F,
                    RATING: extractedValues.RATING,
                    CC: extractedValues.CC,
                    USABLE_AT: extractedValues.USABLE_AT,
                    BEARINGS_DE: extractedValues.BEARINGS_DE,
                    BEARINGS_ODE: extractedValues.BEARINGS_ODE,
                    ENCL: extractedValues.ENCL,
                    SERIAL_NUMBER: extractedValues.SERIAL_NUMBER
                };
                this.inventory.push(motor);
                this.saveItem(motor);
                return;
            }
            catch (error) {
                console.error('Error during OCR processing:', error);
                alert('An error occurred during OCR processing. Please try again with a different image or check the console for more details.');
            }
            finally {
                this.loading = false;
                this.cd.detectChanges();
            }
        } else if (this.inputType == "Files") {
            try {
                for (let i = 0; i < this.filesInput.length; i++) {
                    this.cd.detectChanges();

                    const file = this.filesInput[i];

                    try {
                        const canvas = await this.imageUtils.prepareImage(file.fullFile);

                        const text = await this.ocr.extractText(canvas, file.name);

                        const description = new NormalizeTextPipe().transform(text);

                        const extractedValues = await this.textExtractor.extractValues(description);

                        const motor: motorData = {
                            id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
                            name: file.name,
                            result: text,
                            description,
                            image: typeof file.content === 'string' ? file.content : undefined,
                            savedAt: new Date().toLocaleString(),
                            CAT_NO: extractedValues.CAT_NO,
                            SPEC: extractedValues.SPEC,
                            HORSEPOWER: extractedValues.HORSEPOWER,
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
                            NEMA_NOM_EFF: extractedValues.NEMA_NOM_EFF,
                            P_F: extractedValues.P_F,
                            RATING: extractedValues.RATING,
                            CC: extractedValues.CC,
                            USABLE_AT: extractedValues.USABLE_AT,
                            BEARINGS_DE: extractedValues.BEARINGS_DE,
                            BEARINGS_ODE: extractedValues.BEARINGS_ODE,
                            ENCL: extractedValues.ENCL,
                            SERIAL_NUMBER: extractedValues.SERIAL_NUMBER
                        };
                        this.inventory.push(motor);
                        this.saveItem(motor);

                    } catch (err: any) {
                        console.warn(`Skipping ${file.name}`, err);
                        alert(`Error processing file ${file.name}. Skipping file.`);
                    }
                    this.extractionProgress = ((i + 1) / this.filesInput.length) * 100;
                    this.cd.detectChanges();
                }

            } catch (error) {
                console.error('Unexpected batch error:', error);
            } finally {
                this.loading = false;
                this.cd.detectChanges();
                this._snackBar.open("All Files Processed", "Ok", { duration: 5000 });
            }
        }
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
            const allFields = [
                'CAT_NO', 'SPEC', 'HORSEPOWER', 'VOLTAGE', 'AMPERAGE', 'RPM',
                'FRAME', 'HERTZ', 'PH', 'SER_F', 'CODE', 'DES', 'CLASS',
                'NEMA_NOM_EFF', 'P_F', 'RATING', 'CC', 'USABLE_AT',
                'BEARINGS_DE', 'BEARINGS_ODE', 'ENCL', 'SERIAL_NUMBER'
            ];
            allFields.forEach(field => this.selectedFields.add(field));
        }
        this.allFieldsSelected = !this.allFieldsSelected;
    }

    updateAllFieldsSelected(): void {
        const allFields = [
            'CAT_NO', 'SPEC', 'HORSEPOWER', 'VOLTAGE', 'AMPERAGE', 'RPM',
            'FRAME', 'HERTZ', 'PH', 'SER_F', 'CODE', 'DES', 'CLASS',
            'NEMA_NOM_EFF', 'P_F', 'RATING', 'CC', 'USABLE_AT',
            'BEARINGS_DE', 'BEARINGS_ODE', 'ENCL', 'SERIAL_NUMBER'
        ];
        this.allFieldsSelected = allFields.every(field => this.selectedFields.has(field));
    }

    isFieldSelected(fieldName: string): boolean {
        return this.selectedFields.has(fieldName);
    }
}