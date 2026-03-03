import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { OCRService } from "./ocr";
import { ImageUtils } from "./image-utils";
import { NormalizeTextPipe } from "./normalize-text-pipe";
import { ImagePasser } from "../image-passer";
import { TextExtractorService } from "./text-extractor.service";
import { FormsModule } from "@angular/forms";

interface dataFields {
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
    imports: [FormsModule]
})
export class OCRComponent {
    inventory: dataFields[] = [];
    imageSrc: string | ArrayBuffer | null = null;
    result: string = '';
    description: string = '';
    loading: boolean = false;
    selectedFile: File | null = null;
    private imageUtils = inject(ImageUtils);
    reader = new FileReader();

    constructor(private ocr: OCRService,
        private readonly cd: ChangeDetectorRef,
        private imagePasser: ImagePasser,
        private textExtractor: TextExtractorService) { }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        // Clear the image preview and extraction results
        this.inventory = [];
        this.result = '';
        this.description = '';

        // Check if a file was selected
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            console.log('File selected:', this.selectedFile.name);

            // Validate file size (maximum 10MB)
            const maxSizeMB = 10;
            const fileSizeMB = input.files[0].size / (1024 * 1024);
            if (fileSizeMB > maxSizeMB) {
                alert('File must be smaller than 10MB.');
                this.selectedFile = null;
                this.imageSrc = null;
                return;
            }

            this.reader.readAsDataURL(input.files[0]);
            this.reader.onload = () => {
                this.imageSrc = this.reader.result;
                this.cd.detectChanges();
            };
            // No file selected, set it to null
        } else {
            this.selectedFile = null;
        }
    }
    async onUpload(): Promise<void> {
        // No file selected, let the user know and stop
        if (!this.selectedFile && !this.imagePasser.currentFile) {
            console.error('No File Selected');
            alert("Please select a file to process")
            return;
        }

        // Show the extracting message and begin processing
        this.loading = true;
        console.log("Loading = " + this.loading);

        // Proceed with OCR extraction on the image, first using imageUtils to preprocess, then using Tesseract for OCR
        if (this.selectedFile) {
            try {
                console.log("File being sent to prepareImage:", this.selectedFile);
                console.log("Type:", typeof this.selectedFile);
                console.log("Instanceof File:", this.selectedFile instanceof File);
                const canvas = await this.imageUtils.prepareImage(this.selectedFile!);
                this.result = await this.ocr.extractText(canvas);
                this.description = new NormalizeTextPipe().transform(this.result);
                // Populate developer fields so it's easy to see where to edit                
                const extractedValues = await this.textExtractor.extractValues(this.description);
                this.inventory.push({
                    result: this.result,
                    description: this.description,
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
        }
        // Preprocess and do OCR on an image passed from another component, if it exists
 else if (this.imagePasser.currentFile) {
            try {
                const canvas = await this.imageUtils.prepareImage(this.imagePasser.currentFile!);
                this.result = await this.ocr.extractText(canvas);
                this.description = new NormalizeTextPipe().transform(this.result);

                // Extract values using the TextExtractorService
                const extractedValues = await this.textExtractor.extractValues(this.description);
                this.inventory.push({
                    result: this.result,
                    description: this.description,
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
            }
            catch (error) {
                console.error('Error during OCR processing:', error);
                alert('An error occurred during OCR processing. Please try again with a different image or check the console for more details.');
            }
            finally {
                this.loading = false;
                this.cd.detectChanges();
            }
        }
    }
}