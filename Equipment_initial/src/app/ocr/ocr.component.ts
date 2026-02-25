import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { DecimalPipe } from "@angular/common"
import { OCRService } from "./ocr";
import { ImageUtils } from "./image-utils";
import { NormalizeTextPipe } from "./normalize-text-pipe";
import { ImagePasser } from "../image-passer";

interface uploadedFiles {
    name: string;
    type: string;
    size: number;
    content?: string | ArrayBuffer | null;
    fullFile: File;
}

interface motorData {
    name: string;
    rawData: string;
    cleanedData: string;
}

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    styleUrl: './ocr.component.css',
    imports: [DecimalPipe]
})
export class OCRComponent {
    imageSrc: string | ArrayBuffer | null = null;
    filesInput: uploadedFiles[] = [];
    inventory: motorData[] = [];
    result: string = '';
    cleanedText: string = '';
    VARIABLE_LABEL_1: string = '';
    VARIABLE_LABEL_2: string = '';
    VARIABLE_LABEL_3: string = '';
    VARIABLE_LABEL_4: string = '';
    VARIABLE_LABEL_5: string = '';
    VARIABLE_LABEL_6: string = '';
    VARIABLE_LABEL_7: string = '';
    VARIABLE_LABEL_8: string = '';
    VARIABLE_LABEL_9: string = '';
    VARIABLE_LABEL_10: string = '';
    VARIABLE_LABEL_11: string = '';
    VARIABLE_LABEL_12: string = '';
    VARIABLE_LABEL_13: string = '';
    VARIABLE_LABEL_14: string = '';
    VARIABLE_LABEL_15: string = '';
    VARIABLE_LABEL_16: string = '';
    VARIABLE_LABEL_17: string = '';
    VARIABLE_LABEL_18: string = '';
    VARIABLE_LABEL_19: string = '';
    VARIABLE_LABEL_20: string = '';
    VARIABLE_LABEL_21: string = '';
    VARIABLE_LABEL_22: string = '';
    VARIABLE_LABEL_23: string = '';
    VARIABLE_LABEL_24: string = '';
    VARIABLE_LABEL_25: string = '';
    VARIABLE_LABEL_26: string = '';
    VARIABLE_LABEL_27: string = '';
    loading: boolean = false;
    selectedFile: File | null = null;
    selectedFiles: FileList | null = null;
    private imageUtils = inject(ImageUtils);
    reader = new FileReader();
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    
    constructor(private ocr: OCRService,
        private readonly cd: ChangeDetectorRef,
        private imagePasser: ImagePasser) { }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        // Clear the image preview and extraction results
        this.result = '';
        this.cleanedText = '';
        this.VARIABLE_LABEL_1 = '';
        this.VARIABLE_LABEL_2 = '';
        this.VARIABLE_LABEL_3 = '';
        this.VARIABLE_LABEL_4 = '';
        this.VARIABLE_LABEL_5 = '';
        this.VARIABLE_LABEL_6 = '';
        this.VARIABLE_LABEL_7 = '';
        this.VARIABLE_LABEL_8 = '';
        this.VARIABLE_LABEL_9 = '';
        this.VARIABLE_LABEL_10 = '';
        this.VARIABLE_LABEL_11 = '';
        this.VARIABLE_LABEL_12 = '';
        this.VARIABLE_LABEL_13 = '';
        this.VARIABLE_LABEL_14 = '';
        this.VARIABLE_LABEL_15 = '';
        this.VARIABLE_LABEL_16 = '';
        this.VARIABLE_LABEL_17 = '';
        this.VARIABLE_LABEL_18 = '';
        this.VARIABLE_LABEL_19 = '';
        this.VARIABLE_LABEL_20 = '';
        this.VARIABLE_LABEL_21 = '';
        this.VARIABLE_LABEL_22 = '';
        this.VARIABLE_LABEL_23 = '';
        this.VARIABLE_LABEL_24 = '';
        this.VARIABLE_LABEL_25 = '';
        this.VARIABLE_LABEL_26 = '';
        this.VARIABLE_LABEL_27 = '';
        this.imageSrc = null;
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
        // No file selected, let the user know and stop
        if (!this.filesInput && !this.imagePasser.currentFile) {
            console.error('No File Selected');
            alert("Please select a file to process")
            return;
        }

        // Show the extracting message and begin processing
        this.loading = true;
        console.log("Loading = " + this.loading);
        if (!this.filesInput) {
            throw ("no files selected");
        } else {
            try {
                const promiseCanvas = this.filesInput.map(inFile => this.imageUtils.prepareImage(inFile.fullFile));
                const canvas = await Promise.all(promiseCanvas);

                const promises = canvas.map(cnvs => this.ocr.extractText(cnvs));
                const rawData = await Promise.all(promises);

                const promiseClean = rawData.map(rd => new NormalizeTextPipe().transform(rd));
                const cleanResult = await Promise.all(promiseClean);

                cleanResult.forEach((data, index) => {
                    this.inventory.push({
                        name: "Motor " + index,
                        rawData: rawData[index],
                        cleanedData: data
                    })
                })
            } catch (error) {
                throw (error);
            }
            this.loading = false;
            console.log("Loading = " + this.loading);
            this.result = this.inventory[0].rawData;
            this.cleanedText = this.inventory[0].cleanedData;
            console.log(this.inventory);
            this.cd.detectChanges();
            return;
        }
        // Proceed with OCR extraction on the image, first using imageUtils to preprocess, then using Tesseract for OCR
        if (this.filesInput) {
            const canvas = await this.imageUtils.prepareImage(this.filesInput[0].fullFile)
            this.result = await this.ocr.extractText(canvas);
            this.cleanedText = new NormalizeTextPipe().transform(this.result);
            // Populate developer fields so it's easy to see where to edit
            this.VARIABLE_LABEL_1 = '';
            this.VARIABLE_LABEL_2 = '';
            this.VARIABLE_LABEL_3 = '';
            this.VARIABLE_LABEL_4 = '';
            this.VARIABLE_LABEL_5 = '';
            this.VARIABLE_LABEL_6 = '';
            this.VARIABLE_LABEL_7 = '';
            this.VARIABLE_LABEL_8 = '';
            this.VARIABLE_LABEL_9 = '';
            this.VARIABLE_LABEL_10 = '';
            this.VARIABLE_LABEL_11 = '';
            this.VARIABLE_LABEL_12 = '';
            this.VARIABLE_LABEL_13 = '';
            this.VARIABLE_LABEL_14 = '';
            this.VARIABLE_LABEL_15 = '';
            this.VARIABLE_LABEL_16 = '';
            this.VARIABLE_LABEL_17 = '';
            this.VARIABLE_LABEL_18 = '';
            this.VARIABLE_LABEL_19 = '';
            this.VARIABLE_LABEL_20 = '';
            this.VARIABLE_LABEL_21 = '';
            this.VARIABLE_LABEL_22 = '';
            this.VARIABLE_LABEL_23 = '';
            this.VARIABLE_LABEL_24 = '';
            this.VARIABLE_LABEL_25 = '';
            this.VARIABLE_LABEL_26 = '';
            this.VARIABLE_LABEL_27 = '';
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
            this.cleanedText = new NormalizeTextPipe().transform(this.result);

            // Populate developer fields so it's easy to see where to edit
            this.VARIABLE_LABEL_1 = '';
            this.VARIABLE_LABEL_2 = '';
            this.VARIABLE_LABEL_3 = '';
            this.VARIABLE_LABEL_4 = '';
            this.VARIABLE_LABEL_5 = '';
            this.VARIABLE_LABEL_6 = '';
            this.VARIABLE_LABEL_7 = '';
            this.VARIABLE_LABEL_8 = '';
            this.VARIABLE_LABEL_9 = '';
            this.VARIABLE_LABEL_10 = '';
            this.VARIABLE_LABEL_11 = '';
            this.VARIABLE_LABEL_12 = '';
            this.VARIABLE_LABEL_13 = '';
            this.VARIABLE_LABEL_14 = '';
            this.VARIABLE_LABEL_15 = '';
            this.VARIABLE_LABEL_16 = '';
            this.VARIABLE_LABEL_17 = '';
            this.VARIABLE_LABEL_18 = '';
            this.VARIABLE_LABEL_19 = '';
            this.VARIABLE_LABEL_20 = '';
            this.VARIABLE_LABEL_21 = '';
            this.VARIABLE_LABEL_22 = '';
            this.VARIABLE_LABEL_23 = '';
            this.VARIABLE_LABEL_24 = '';
            this.VARIABLE_LABEL_25 = '';
            this.VARIABLE_LABEL_26 = '';
            this.VARIABLE_LABEL_27 = '';

            // OCR complete, no more loading message
            this.loading = false;
            console.log("Loading = " + this.loading);
            this.cd.detectChanges();
            return;
        }

    }
}