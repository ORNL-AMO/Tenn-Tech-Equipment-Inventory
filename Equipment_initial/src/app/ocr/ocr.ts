import { inject, Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { ImagePasser } from '../image-passer';
import { MatDialog } from '@angular/material/dialog';
import { OcrWarningDialog, OcrErrorDialog, GenericErrorDialog } from '../error.dialog';

@Injectable({
  providedIn: 'root',
})

export class OCRService {
  private dialog = inject(MatDialog);
  constructor(private imagePasser: ImagePasser) { }
  async extractText(image: HTMLCanvasElement | HTMLImageElement, name: string): Promise<string> {

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
        const preview =
          salvagedText.length > 150
            ? salvagedText.substring(0, 150) + '...'
            : salvagedText;

        const dialogRef = this.dialog.open(OcrWarningDialog, {
          data: {
            name,
            preview
          }
        });

        const result = await dialogRef.afterClosed().toPromise();

        if (result === 'keep') {
          return salvagedText;
        } else if (result === 'discard') {
          this.dialog.open(OcrErrorDialog);
        } else {
          throw new Error("OCR failed and salvageable text was discarded by user");
        }
      }
      else if (err.message === "OCR Timeout") {
        this.dialog.open(GenericErrorDialog, {
          data: {
            title: 'OCR Timeout',
            message: 'OCR took too long and was stopped. No salvageable text was found.'
          }
        });

        throw new Error("OCR failed due to timeout with no salvageable text");
      }
      else {
        this.dialog.open(GenericErrorDialog, {
          data: {
            title: 'OCR Error',
            message: 'An unexpected error occurred during OCR processing.'
          }
        });

        throw new Error("Unexpected OCR error: " + err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      await worker.terminate();
    }
    return "";
  }
}
