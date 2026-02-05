import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class ImageUtils {
  prepareImage(file: File): Promise<HTMLCanvasElement> {
    console.log("Prepareing Image");
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Resize for OCR accuracy
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        //convert to grayscale + boost contrast
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData!.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const contrast = avg > 150 ? 255 : 0;

          data[i] = data[i + 1] = data[i + 2] = contrast;
        }

        ctx?.putImageData(imageData, 0, 0);
        resolve(canvas);
      };
    });
  }
}
