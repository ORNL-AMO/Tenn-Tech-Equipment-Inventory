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

    let timeoutId: any;

    try {
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-/%() ',
        preserve_interword_spaces: '1'
      });

      const recognizePromise = worker.recognize(image);

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("OCR Timeout after 15 seconds"));
        }, 1500);
      });

      const result = await Promise.race([
        recognizePromise,
        timeoutPromise
      ]) as any;

      clearTimeout(timeoutId);

      return result.data.text;

    } finally {
      clearTimeout(timeoutId);
      await worker.terminate();
    }
  }
}
