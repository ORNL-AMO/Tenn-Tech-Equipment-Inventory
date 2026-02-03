import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OCRService } from "./ocr";
import { prepareImage } from "./image-utils";
import { normalizeText } from "./text-normalizer";

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    styleUrl: './ocr.component.css',
    imports: [CommonModule]
})
export class OCRComponent {
    result = '';
    loading = false;
    cleanedText = '';
    selectedFile: File | null = null;

    constructor(private ocr: OCRService) {}

    async onFileSelected(event: Event): Promise<void>{
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0){
            this.selectedFile = input.files[0];
            console.log('File selected:', this.selectedFile.name);
        } else {
            this.selectedFile = null;
        }
    }
    async onUpload(): Promise<void> {
        if(!this.selectedFile){
            console.error('No File Selected');
            return;
        }

        this.loading = true;
        console.log("Loading = " + this.loading);
        
        const canvas = await prepareImage(this.selectedFile);
        this.result = await this.ocr.extractText(canvas);
        this.cleanedText = normalizeText(this.result);
        this.loading = false;
        console.log("Loading = " + this.loading);    
    }
}