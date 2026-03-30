import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { ImagePasser } from '../image-passer';
import Swal from 'sweetalert2';
import { BehaviorSubject, Observable } from 'rxjs';
import { reduceEachTrailingCommentRange } from 'typescript';

@Injectable({
  providedIn: 'root',
})
export class OCRService {
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
        const preview = salvagedText.length > 150 ? salvagedText.substring(0, 150) + '...' : salvagedText;
        const choice = await Swal.fire({
          // Format a preview of the text (cap it at 150 characters for the modal)
          icon: 'warning',
          title: 'Low Confidence Read',
          html: `
            <div class="text-start">
              <p class="mb-2">We struggled to read this image: ${name}. Make sure the photo is clear, well lit, and upright. Here is a preview of what it salvaged:</p>
              <pre class="bg-light p-2 border rounded text-muted" style="font-size: 0.8rem; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${preview}</pre>
              <p class="mb-0 mt-2 fw-bold">Do you want to keep this partial text?</p>
            </div>`,
          showCancelButton: true,
          confirmButtonText: 'Keep it',
          cancelButtonText: 'Discard',
          confirmButtonColor: '#007d34',
          cancelButtonColor: '#dc3545',
          reverseButtons: true
        });

        // Apply their choice
        if (choice.isConfirmed) {
          return salvagedText;
        } else if (choice.isDenied) {
          Swal.fire({
            icon: 'error',
            title: 'OCR Failed',
            text: 'OCR failed with no salvageable text'
          });
        } else {
          throw new Error("OCR failed and salvageable text was discarded by user");
        }
      }
      else if (err.message === "OCR Timeout") {
        Swal.fire({
          icon: 'error',
          title: 'OCR Timeout',
          text: 'OCR took too long and was stopped. No salvageable text was found.'
        });
        throw new Error("OCR failed due to timeout with no salvageable text");
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'OCR Error',
          text: 'An unexpected error occurred during OCR processing.'
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
