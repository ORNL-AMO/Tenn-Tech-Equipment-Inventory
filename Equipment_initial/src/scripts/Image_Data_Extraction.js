/****************************************************************************************************************
*   File: Image_Data_Extraction.js                                                                              *
*   Description: This file contains the main script that takes in an input image using OpenCV, converts it to   *
*   grayscale to enhance text visibility, and then uses Tesseract to parse it and extract any english text      *
*   found within the image. The extracted text is then returned via a callback function.                        *
****************************************************************************************************************/

window.OCRProcessor = {
    async processImage(file, canvasInputId, canvasProcessedId, outputCallback) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = async () => {
                //Draw image on input canvas
                const canvasInput = document.getElementById(canvasInputId); //Example element until we get 
                const ctx = canvasInput.getContext("2d");

                canvasInput.width = img.width;
                canvasInput.height = img.height;
                ctx.drawImage(img, 0, 0);

                //Now run OpenCV preprocessing
                let src = cv.imread(canvasInput);
                let gray = new cv.Mat();
                let thresh = new cv.Mat();

                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
                cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

                //Show processed image
                const canvasProcessed = document.getElementById(canvasProcessedId);
                cv.imshow(canvasProcessed, thresh);

                //Run OCR with Tesseract
                const { data: { text } } = await Tesseract.recognize(canvasProcessed, 'eng');

                outputCallback(text);

                //Cleanup
                src.delete();
                gray.delete();
                thresh.delete();

                resolve(text);
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
};

//IMPORTANT: DO NOT FORGET!!!!!
//Include script tags like these into our HTML file to actually load this script
//<script src="https://docs.opencv.org/4.x/opencv.js"></script>
//<script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js"></script>
//<script src="assets/ocr.js"></script>    <-- This pathway will be changed depending on where we put this file
//Make sure to make TypeScript happy by declaring this global function there. The following should do this, but
//test to double check!
/* declare global {
  interface Window {
    OCRProcessor: any;
  }
}
*/