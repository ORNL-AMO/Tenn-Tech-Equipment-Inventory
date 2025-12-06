export async function processImage() {
    const input = document.getElementById("imageUpload");
    const canvasInput = document.getElementById("canvasInput");
    const canvasProcessed = document.getElementById("canvasProcessed");
    const outputText = document.getElementById("outputText");

    input.addEventListener("change", async function () {
        const file = input.files[0];
        const img = new Image();

        img.onload = async () => {
            // Draw original image
            canvasInput.width = img.width;
            canvasInput.height = img.height;
            const ctx = canvasInput.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // Run OpenCV preprocessing
            let src = cv.imread(canvasInput);
            let gray = new cv.Mat();
            let thresh = new cv.Mat();

            // Convert to grayscale
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

            // Apply thresholding to enhance text
            cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

            // Display processed image
            cv.imshow(canvasProcessed, thresh);

            // Run OCR using Tesseract.js
            const { data: { text } } = await Tesseract.recognize(canvasProcessed, "eng", {
                logger: m => console.log(m)
            });

            outputText.textContent = "Extracted Text:\n\n" + text;

            // Cleanup
            src.delete();
            gray.delete();
            thresh.delete();
        };

        img.src = URL.createObjectURL(file);
    });


}