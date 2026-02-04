import { Component, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePasser } from '../image-passer';
import { OCRComponent } from '../ocr/ocr.component';
import { OCRService } from "../ocr/ocr";
import { ImageUtils } from "../ocr/image-utils";

@Component({
  selector: 'app-webcam',
  imports: [CommonModule],
  templateUrl: './webcam.html',
  styleUrl: './webcam.css',
})
export class Webcam {

  constructor(private imagePasser: ImagePasser) { }
  deviceId?: string;
  currentDevice?: string;
  showDevices: boolean = false;
  webcamPermission: boolean = false;
  camOn: boolean = false;

  //Call these functions via buttons on the HTML page
  checkPermission() {
    this.requestCameraPermissions();
    this.setMediaDevices();
  }
  chooseDevice() {
    this.setMediaDevices();
    this.showDevices = !this.showDevices;
  }
  selectDevice(device: MediaDeviceInfo) {
    this.deviceId = device.deviceId;
    this.showDevices = false;
    if (this.camOn) { this.startCam(); }
    console.log(this.deviceId);
    this.currentDevice = device.label;
    console.log(this.currentDevice);
  }
  startCam() {
    this.startStreaming();
    this.camOn = true;
  }
  stopCam() {
    this.closeStream()
    this.camOn = false;
  }
  capturedImageDataUrl?: string;
  capturedImageBlob?: Blob;

  async capCam(): Promise<Blob> {
    if (!this.camOn || !this.videoElement?.nativeElement) {
      throw new Error('Camera is not running');
    }
  
    const video = this.videoElement.nativeElement as HTMLVideoElement;
    await this.waitForVideoReady(video);

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new Error('Unable to read video dimensions');
    }

    // Use an offscreen canvas to capture a frame.
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to create canvas context');
    }
    ctx.drawImage(video, 0, 0, width, height);

    // Data URL for simple previews.
    this.capturedImageDataUrl = canvas.toDataURL('image/png');

    // Blob for uploads / saving.
    const blob = await this.canvasToBlob(canvas, 'image/png');
    this.imagePasser.setBlobAsFile(blob, 'capture.png');
    this.capturedImageBlob = blob;
    return blob;
  }

  private waitForVideoReady(video: HTMLVideoElement): Promise<void> {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('Video element failed to load data'));
      };
      const cleanup = () => {
        video.removeEventListener('loadeddata', onLoaded);
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
      };
      video.addEventListener('loadeddata', onLoaded, { once: true });
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('error', onError, { once: true });
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) {
          reject(new Error('Canvas toBlob returned null'));
          return;
        }
        resolve(b);
      }, type);
    });
  }

  async requestCameraPermissions() {
    try {
      console.log("Camera Permission request");
      const constraints = { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // let tracks: Array<MediaStreamTrack> = stream.getTracks();
      // for (let i = 0; i < tracks.length; i++) {
      //   const track = tracks[i];
      //   track.stop();
      // }
      stream.getTracks().forEach(track => track.stop());
      console.log("Camera permission granted");
      this.webcamPermission = true;
    } catch (err) {
      console.log("Camera Permission error");
      console.log(err);
      this.webcamPermission = false;
      alert("Camera Permission Denied\nPlease grant camera permission to this website to use camera functionality");
    }
  }

  mediaDevices: Array<MediaDeviceInfo> = []
  async setMediaDevices() {
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    this.mediaDevices = new Array();
    for (let i = 0; i < allDevices.length; i++) {
      let device = allDevices[i];
      if (device.kind == 'videoinput') {
        this.mediaDevices.push(device);
      }
    }
  }

  mediaStream!: MediaStream;
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  async startStreaming() {
    if (this.mediaStream) {
      this.closeStream(this.mediaStream);
    }
    this.mediaStream = await this.getSelectedDeviceMediaStream();
    //put this into html page to show webcam
    /*<video id="videoElement" #videoElement />*/
    this.videoElement.nativeElement.srcObject = this.mediaStream;
    this.videoElement.nativeElement.play();
    console.log("Camera Started");
  }

  closeStream(stream: MediaStream = this.mediaStream) {
    stream.getTracks().forEach(track => track.stop());
    this.videoElement.nativeElement.srcObject = null;
    console.log("Camera Closed");
  }

  async getSelectedDeviceMediaStream(): Promise<MediaStream> {
    await this.setMediaDevices();
    let webcamDevice;
    if (this.mediaDevices.length > 0) {
      if (this.deviceId) {
        webcamDevice = this.mediaDevices.find(device => device.deviceId === this.deviceId);
      } else {
        if (this.mediaDevices.length > 1) {
          //select back camera by default if available
          let backDevice = this.mediaDevices.find(device => {
            return device.label.toLowerCase().includes('back');
          });
          if (backDevice) {
            webcamDevice = backDevice;
            this.deviceId = webcamDevice.deviceId;
          } else {
            //select first cam
            webcamDevice = this.mediaDevices[0];
            this.deviceId = webcamDevice.deviceId;
          }
        } else {
          //if only one camera available
          webcamDevice = this.mediaDevices[0];
          this.deviceId = webcamDevice.deviceId;
        }
      }
    }

    if (!webcamDevice) {
      throw new Error('Webcam not found');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: webcamDevice.deviceId
      }
    });
    return stream;
  }
}
