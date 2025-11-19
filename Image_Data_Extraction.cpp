// Image Data Extraction

#include <iostream>
#include <string>
#include <regex>
#include <vector>
#include <filesystem>

#include <opencv2/opencv.hpp>
#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>

namespace fs = std::filesystem;

// Adjust Contrast
cv::Mat adjustContrast(const cv::Mat& img, double alpha) {
    cv::Mat new_img;
    img.convertTo(new_img, -1, alpha, 0);
    return new_img;
}

// Convert OpenCV Mat → Pix
Pix* matToPix(const cv::Mat& img) {
    cv::Mat gray;

    if (img.channels() == 3) {
        cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);
    } else if (img.channels() == 4) {
        cv::cvtColor(img, gray, cv::COLOR_BGRA2GRAY);
    } else {
        gray = img.clone();
    }

    Pix* pix = pixCreate(gray.cols, gray.rows, 8);
    l_uint32* data = pixGetData(pix);
    int wpl = pixGetWpl(pix);

    for (int y = 0; y < gray.rows; y++) {
        uint8_t* row = gray.ptr<uint8_t>(y);
        for (int x = 0; x < gray.cols; x++) {
            data[y * wpl + x] = row[x];
        }
    }

    return pix;
}

// Run Tesseract OCR on Mat
std::string runTesseract(const cv::Mat& img, tesseract::TessBaseAPI& api) {
    Pix* pix = matToPix(img);
    api.SetImage(pix);

    char* outText = api.GetUTF8Text();
    std::string result(outText ? outText : "");

    delete[] outText;
    pixDestroy(&pix);

    return result;
}

// OCR Validation
bool isValidOCR(const std::string& text) {
    std::regex r(R"(\w+\s*\d+)");
    return std::regex_search(text, r);
}

// Parse "Category 150"
void parseText(const std::string& text) {
    std::regex r(R"((\w+)\s*[:\-]?\s*(\d+))");
    std::smatch m;

    auto searchStart = text.cbegin();
    while (std::regex_search(searchStart, text.cend(), m, r)) {
        std::string category = m[1];
        int value = std::stoi(m[2]);

        std::cout << "Found category: \"" << category
                  << "\", value: " << value << "\n";

        searchStart = m.suffix().first;
    }
}

// Open & Process File
void file_open(const std::string& filename) {
    if (!fs::exists(filename)) {
        std::cerr << "File does not exist: " << filename << "\n";
        return;
    }

    cv::Mat img = cv::imread(filename, cv::IMREAD_COLOR);
    if (img.empty()) {
        std::cerr << "Cannot load image: " << filename << "\n";
        return;
    }

    tesseract::TessBaseAPI api;
    if (api.Init(nullptr, "eng")) {
        std::cerr << "Failed to initialize Tesseract.\n";
        return;
    }

    std::vector<double> contrastLevels = {1.0, 1.2, 1.4};
    std::string finalText;
    bool success = false;

    for (double alpha : contrastLevels) {
        cv::Mat processed = adjustContrast(img, alpha);
        std::string text = runTesseract(processed, api);

        if (isValidOCR(text)) {
            success = true;
            finalText = std::move(text);
            break;
        }
    }

    if (success) {
        std::cout << "OCR succeeded for file: " << filename << "\n";
        std::cout << "Raw text:\n" << finalText << "\n";
        parseText(finalText);
    } else {
        std::cerr << "OCR failed for file: " << filename
                  << " after contrast attempts.\n";
    }

    api.End();
}

// Main
int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <image_filename>\n";
        return 1;
    }

    file_open(argv[1]);
    return 0;
}