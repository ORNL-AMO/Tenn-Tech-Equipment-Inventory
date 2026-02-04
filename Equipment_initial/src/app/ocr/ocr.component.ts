import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { OCRService } from "./ocr";
import { ImageUtils } from "./image-utils";
import { NormalizeTextPipe } from "./normalize-text-pipe";

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    styleUrl: './ocr.component.css',
    imports: [NormalizeTextPipe]
})
export class OCRComponent {
    imageSrc: string | ArrayBuffer | null = null;
    result: string = '';
    loading: boolean = false;
    selectedFile: File | null = null;
    private imageUtils = inject(ImageUtils);
    reader = new FileReader();

    constructor(private ocr: OCRService,
        private readonly cd: ChangeDetectorRef) { }

        async onFileSelected(event: Event): Promise<void> {
            const input = event.target as HTMLInputElement;
            if (input.files && input.files.length > 0) {
                this.selectedFile = input.files[0];
                console.log('File selected:', this.selectedFile.name);
                this.reader.readAsDataURL(input.files[0]);
                this.reader.onload = () => {
                    this.imageSrc = this.reader.result;
                    this.cd.detectChanges();
                };
        } else {
            this.selectedFile = null;
        }
    }
    async onUpload(): Promise<void> {
        if (!this.selectedFile) {
            console.error('No File Selected');
            alert("Please select a file to process")
            return;
        }

        this.loading = true;
        console.log("Loading = " + this.loading);


        const canvas = await this.imageUtils.prepareImage(this.selectedFile);
        this.result = await this.ocr.extractText(canvas);
        this.loading = false;
        console.log("Loading = " + this.loading);
        this.cd.detectChanges();
        return;
    }
}