import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OCRService } from "./ocr";
import { prepareImage } from "./image-utils";
import { normalizeText } from "./text-normalizer";

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html',
    imports: [CommonModule]
})
export class OCRComponent {
    result = '';
    loading = false;
    cleanedText = '';

    constructor(private ocr: OCRService) {}

    async onFile(event: any) {
        // const input = document.getElementById("imageIn");
        const file = event.target.files[0];
        if (!file) return;

        this.loading = true;
        console.log("Loading = " + this.loading);

        const canvas = await prepareImage(file);
        this.result = await this.ocr.extractText(canvas);
        this.cleanedText = normalizeText(this.result);
        this.loading = false;
        console.log("Loading = " + this.loading);
    }
}