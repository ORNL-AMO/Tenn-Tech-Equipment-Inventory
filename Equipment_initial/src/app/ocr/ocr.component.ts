import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { OCRService } from "./ocr";
import { ImageUtils } from "./image-utils";
import { NormalizeTextPipe } from "./normalize-text-pipe";
import { ImagePasser } from "../image-passer";
import { TextExtractorService } from "./text-extractor.service";

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    styleUrl: './ocr.component.css'
})
export class OCRComponent {
    imageSrc: string | ArrayBuffer | null = null;
    result: string = '';
    description: string = '';
    CAT_NO: string = '';
    SPEC: string = '';
    HORSEPOWER: string = '';
    VOLTAGE: string = '';
    AMPERAGE: string = '';
    RPM: string = '';
    FRAME: string = '';
    HERTZ: string = '';
    PH: string = '';
    SER_F: string = '';
    CODE: string = '';
    DES: string = '';
    CLASS: string = '';
    NEMA_NOM_EFF: string = '';
    P_F: string = '';
    RATING: string = '';
    CC: string = '';
    USABLE_AT: string = '';
    BEARINGS_DE: string = '';
    BEARINGS_ODE: string = '';
    ENCL: string = '';
    SERIAL_NUMBER: string = '';
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
        this.result = '';
        this.description = '';
        this.CAT_NO = '';
        this.SPEC = '';
        this.HORSEPOWER = '';
        this.VOLTAGE = '';
        this.AMPERAGE = '';
        this.RPM = '';
        this.FRAME = '';
        this.HERTZ = '';
        this.PH = '';
        this.SER_F = '';
        this.CODE = '';
        this.DES = '';
        this.CLASS = '';
        this.NEMA_NOM_EFF = '';
        this.P_F = '';
        this.RATING = '';
        this.CC = '';
        this.USABLE_AT = '';
        this.BEARINGS_DE = '';
        this.BEARINGS_ODE = '';
        this.ENCL = '';
        this.SERIAL_NUMBER = '';

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
            const canvas = await this.imageUtils.prepareImage(this.selectedFile)
            this.result = await this.ocr.extractText(canvas);
            this.description = new NormalizeTextPipe().transform(this.result);
            // Extract values from description and populate fields
            const extractedValues = this.textExtractor.extractValues(this.description);
            Object.assign(this, extractedValues);
            // OCR complete, no more loading message
            this.loading = false;
            console.log("Loading = " + this.loading);
            this.cd.detectChanges();
            return;
        }
        // Preprocess and do OCR on an image passed from another component, if it exists
        else if (this.imagePasser.currentFile) {
            const canvas = await this.imageUtils.prepareImage(this.imagePasser.currentFile!);
            this.result = await this.ocr.extractText(canvas);
            this.description = new NormalizeTextPipe().transform(this.result);

            // Extract values from description and populate fields
            const extractedValues = this.textExtractor.extractValues(this.description);
            Object.assign(this, extractedValues);

            // OCR complete, no more loading message
            this.loading = false;
            console.log("Loading = " + this.loading);
            this.cd.detectChanges();
            return;
            }

        }
    }