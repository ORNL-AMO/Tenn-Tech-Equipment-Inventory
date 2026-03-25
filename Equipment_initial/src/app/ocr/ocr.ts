import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { ImagePasser } from '../image-passer';
import { BehaviorSubject, Observable } from 'rxjs';
import { reduceEachTrailingCommentRange } from 'typescript';

@Injectable({
  providedIn: 'root',
})
export class OCRService {
  constructor(private imagePasser: ImagePasser) { }
  async extractText(image: HTMLCanvasElement | HTMLImageElement): Promise<string> {

    const worker = await createWorker('eng');

    let timeoutId: any;
    let salvagedText: string = "";

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

      const { text, confidence } = result.data;

      console.log(confidence);

      // Count actual letters and numbers
      const alphaNumCount = (result.data.text.match(/[a-zA-Z0-9]/g) || []).length;
      // Calculate what percentage of the string uses the alphabet and numeric data
      const alphaNumRatio = result.data.text.length > 0 ? (alphaNumCount / result.data.text.length) : 0;

      // If a string is mostly symbols and spaces, it is a hallucinated background texture
      const isConfidentGarbage = result.data.text.length > 5 && alphaNumRatio < 0.5;

      // Trigger if too short, low confidence, OR if it's confident garbage
      if (result.data.text.length < 3 || confidence < 30 || isConfidentGarbage) {
        const err = new Error("GibberishDetected");
        salvagedText = result.data.text;
        throw err;
      }

      return result.data.text;

    } catch (err: any) {
      if (err.message === "GibberishDetected") {
        alert("OCR failed but salvaged text is available and will be placed into Description");
        return salvagedText;
      } else {
        throw new Error("OCR failed with no salvageable text");
      }
    } finally {
      clearTimeout(timeoutId);
      await worker.terminate();
    }
  }
}
