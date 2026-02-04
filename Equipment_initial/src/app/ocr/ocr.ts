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

    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-/%() ',
      preserve_interword_spaces: '1'
    });

    const { data } = await worker.recognize(image);
    console.log("worker recognized image");
    await worker.terminate();
    console.log("worker terminated");

    return data.text;
  }
}
