import { Component } from "@angular/core";
import { OCRService } from "./ocr";
import { prepareImage } from "./image-utils";
import { normalizeText } from "./text-normalizer";

@Component({
    selector: 'app-ocr',
    templateUrl: './ocr.component.html'
})
export class OCRComponent {
    result = '';
    loading = false;
    cleanedText = '';

    constructor(private ocr: OCRService) {}

    async onFile(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        this.loading = true;

        const canvas = await prepareImage(file);
        this.result = await this.ocr.extractText(canvas);
        this.cleanedText = normalizeText(this.result);
        this.loading = false;
    }
}