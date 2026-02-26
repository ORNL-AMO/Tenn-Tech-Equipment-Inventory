import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { ImagePasser } from '../image-passer';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OCRService {
  constructor(private imagePasser: ImagePasser) { }
    async extractText(image: HTMLCanvasElement | HTMLImageElement): Promise<string> {
    const worker = await createWorker('eng');

    try {
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-/%() ',
        preserve_interword_spaces: '1'
      });

      const result = await Promise.race([
        worker.recognize(image),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("OCR Timeout after 15 seconds")), 15000)
        )
      ]) as any;

      return result.data.text;
    }
    finally {
      await worker.terminate();
    }
  }
}
