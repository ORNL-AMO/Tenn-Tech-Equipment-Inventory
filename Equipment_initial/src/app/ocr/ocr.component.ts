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
    imports: [DecimalPipe, MatSlideToggleModule, MatProgressSpinnerModule, FormsModule, MatGridListModule, MatButtonModule, MatDividerModule]
})
export class OCRComponent {
    imageSrc: string | ArrayBuffer | null = null;
    filesInput: uploadedFiles[] = [];
    inventory: motorData[] = [];
    result: string = '';
    cleanedText: string = '';
    loading: boolean = false;
    private imageUtils = inject(ImageUtils);
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    useFiles = false; //Default state

    constructor(private ocr: OCRService,
        private readonly cd: ChangeDetectorRef,
        private imagePasser: ImagePasser) { }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        // Clear the image preview and extraction results
        this.result = '';
        this.cleanedText = '';
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
        if (!(this.filesInput.length > 0) && this.useFiles) {
            console.error('No File Selected');
            alert("Please select a file to process")
            return;
        }else if(!this.imagePasser.currentFile && !this.useFiles){
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
            // Show the extracting message and begin processing
            this.loading = true;
            console.log("Loading = " + this.loading);
            // Preprocess and do OCR on an image passed from another component, if it exists
            const canvas = await this.imageUtils.prepareImage(this.imagePasser.currentFile!);
            const result = await this.ocr.extractText(canvas);
            const cleanedText = new NormalizeTextPipe().transform(this.result);

            // Populate developer fields so it's easy to see where to edit
            this.inventory = []
            this.inventory.push({
                name: "Camera Input",
                rawData: result,
                cleanedData: cleanedText
            })

            // OCR complete, no more loading message
            this.loading = false;
            console.log("Loading = " + this.loading);
            this.cd.detectChanges();
            return;
        }
        else if (this.useFiles) {
            try {
                const promiseCanvas = this.filesInput.map(inFile => this.imageUtils.prepareImage(inFile.fullFile));
                const canvas = await Promise.all(promiseCanvas);

                const promises = canvas.map(cnvs => this.ocr.extractText(cnvs));
                const rawData = await Promise.all(promises);

                const promiseClean = rawData.map(rd => new NormalizeTextPipe().transform(rd));
                const cleanResult = await Promise.all(promiseClean);

                cleanResult.forEach((data, index) => {
                    this.inventory.push({
                        name: this.filesInput[index].name,
                        rawData: rawData[index],
                        cleanedData: data
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
    }
}