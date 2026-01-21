/**
 * 1. CAPTURE FUNCTION
 * Opens the iPhone Camera/Gallery menu and returns the selected File object.
 */
export function captureImage() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // Forces the Camera/Gallery menu on iOS

        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                resolve(file);
            } else {
                reject("No image selected");
            }
        };
        
        input.click(); // Programmatically clicks the hidden input
    });
}

/**
 * 2. EXTRACTION FUNCTION
 * Takes a File object, runs Tesseract, and returns the text.
 * Note: Your teammate will import 'Tesseract' from npm. 
 * For this test, we pass the Tesseract object in.
 */
export async function extractText(file, Tesseract) {
    console.log("Starting extraction...");
    
    // Create the worker
    const worker = await Tesseract.createWorker("eng");
    
    // Recognize text
    const { data: { text } } = await worker.recognize(file);
    
    // Cleanup
    await worker.terminate();
    
    return text;
}

const btn = document.getElementById('scanBtn');
        const status = document.getElementById('status');
        const output = document.getElementById('output');

        btn.addEventListener('click', async () => {
            try {
                //Get the Image
                status.innerText = "Waiting for camera...";
                const file = await captureImage();
                
                //Extract Text
                status.innerText = "Processing (this may take a moment)...";
                
                //We pass the global 'Tesseract' object loaded from the CDN
                const text = await extractText(file, window.Tesseract);
                
                status.innerText = "Done!";
                output.innerText = text;

            } catch (err) {
                console.error(err);
                status.innerText = "Error: " + err;
            }
        });