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

      // Give worker time to fully initialize before timeout applies
      await new Promise(resolve => setTimeout(resolve, 50));

      const recognizePromise = worker.recognize(image);

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("OCR Timeout"));
        }, 15000);
      });

      const result = await Promise.race([
        recognizePromise,
        timeoutPromise
      ]) as any;

      return result.data.text;

    } finally {
      clearTimeout(timeoutId);
      await worker.terminate();

      
    }
  }
}
