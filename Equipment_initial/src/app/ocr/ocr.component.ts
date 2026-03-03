import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { DecimalPipe } from "@angular/common"
import { OCRService } from "./ocr";
import { ImageUtils } from "./image-utils";
import { NormalizeTextPipe } from "./normalize-text-pipe";
import { ImagePasser } from "../image-passer";
import { FormsModule } from "@angular/forms";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TextExtractorService } from "./text-extractor.service";
import { MatInputModule } from "@angular/material/input";


interface uploadedFiles {
    name: string;
    type: string;
    size: number;
    content?: string | ArrayBuffer | null;
    fullFile: File;
}

interface motorData {
    name: string;
    result: String,
    description: String,
    CAT_NO: String,
    SPEC: String,
    HORSEPOWER: String,
    VOLTAGE: String,
    AMPERAGE: String,
    RPM: String,
    FRAME: String,
    HERTZ: String,
    PH: String,
    SER_F: String,
    CODE: String,
    DES: String,
    CLASS: String,
    NEMA_NOM_EFF: String,
    P_F: String,
    RATING: String,
    CC: String,
    USABLE_AT: String,
    BEARINGS_DE: String,
    BEARINGS_ODE: String,
    ENCL: String,
    SERIAL_NUMBER: String
}

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    styleUrl: './ocr.component.css',
    imports: [DecimalPipe, MatSlideToggleModule, MatProgressSpinnerModule, MatGridListModule, MatButtonModule, MatDividerModule, MatInputModule, FormsModule]
})
export class OCRComponent {
    inventory: motorData[] = [];
    imageSrc: string | ArrayBuffer | null = null;
    filesInput: uploadedFiles[] = [];
    loading: boolean = false;
    private imageUtils = inject(ImageUtils);
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    useFiles = false; //Default state

    constructor(private ocr: OCRService,
        private readonly cd: ChangeDetectorRef,
        private imagePasser: ImagePasser,
        private textExtractor: TextExtractorService) { }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        // Clear the image preview and extraction results
        this.inventory = [];
        this.filesInput = []; //Clear previous files
        this.inventory = []; //Clear previous inventory

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
                    }
                    else if (!this.allowedTypes.includes(file.type)) {
                        alert(file.name + "is an invalid file type. Skipping file");
                        return;
                    }
                    else {
                        this.filesInput.push({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            content: reader.result,
                            fullFile: file
                        });
                        console.log('File added:', file.name);
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

    async onUpload(): Promise<void> {
        this.inventory = [];
        // No file selected, let the user know and stop
        if (!(this.filesInput.length > 0) && this.useFiles) {
            console.error('No File Selected');
            alert("Please select a file to process")
            return;
        } else if (!this.imagePasser.currentFile && !this.useFiles) {
            console.error('No capture available');
            alert("No Image captured from camera");
            return;
        }
        this.loading = true;
        if (!this.useFiles) { //use camera
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
                const result = await this.ocr.extractText(canvas);
                const description = new NormalizeTextPipe().transform(result);
                // Populate developer fields so it's easy to see where to edit                
                const extractedValues = await this.textExtractor.extractValues(description);
                this.inventory.push({
                    name: "Camera input",
                    result: result,
                    description: description,
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
                })
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
        } else if (this.useFiles) {
            try {
                const promiseCanvas = this.filesInput.map(inFile => this.imageUtils.prepareImage(inFile.fullFile));
                const canvas = await Promise.all(promiseCanvas);

                const promises = canvas.map(cnvs => this.ocr.extractText(cnvs));
                const result = await Promise.all(promises);

                const promiseClean = result.map(rd => new NormalizeTextPipe().transform(rd));
                const description = await Promise.all(promiseClean);

                // Extract values using the TextExtractorService
                const promiseExtract = description.map(desc => this.textExtractor.extractValues(desc));
                const extractedValues = await Promise.all(promiseExtract);

                extractedValues.forEach((motor, index) => {
                    this.inventory.push({
                        name: this.filesInput[index].name,
                        result: result[index],
                        description: description[index],
                        CAT_NO: motor.CAT_NO,
                        SPEC: motor.SPEC,
                        HORSEPOWER: motor.HORSEPOWER,
                        VOLTAGE: motor.VOLTAGE,
                        AMPERAGE: motor.AMPERAGE,
                        RPM: motor.RPM,
                        FRAME: motor.FRAME,
                        HERTZ: motor.HERTZ,
                        PH: motor.PH,
                        SER_F: motor.SER_F,
                        CODE: motor.CODE,
                        DES: motor.DES,
                        CLASS: motor.CLASS,
                        NEMA_NOM_EFF: motor.NEMA_NOM_EFF,
                        P_F: motor.P_F,
                        RATING: motor.RATING,
                        CC: motor.CC,
                        USABLE_AT: motor.USABLE_AT,
                        BEARINGS_DE: motor.BEARINGS_DE,
                        BEARINGS_ODE: motor.BEARINGS_ODE,
                        ENCL: motor.ENCL,
                        SERIAL_NUMBER: motor.SERIAL_NUMBER
                    })
                })

                this.loading = false;
                console.log("Loading = " + this.loading);
                this.cd.detectChanges();
                return;
            } catch (error) {
                throw (error);
            }
        }
    }}