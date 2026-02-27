import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ImagePasser } from '../image-passer';
import { MatButtonModule } from '@angular/material/button';
// import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-webcam',
  imports: [MatButtonModule],
  templateUrl: './webcam.html',
  styleUrl: './webcam.css',
})

export class Webcam {

  // Centralized error handler
  private handleError(error: any) {
    console.error('An error occurred:', error);
    if (error.name == "NotReadableError") {
      alert("Could not confirm camera presence.\nMake sure main camera is not in use.\nMake sure camera is on.");
    }
    else if (error.name == "NotAllowedError") {
      alert("Camera permission is denied.\nPlease allow camera to use this function.");
    }
    else if (error.name == "AbortError") {
      alert("Could not open camera.\nAnother application may be using it already.");
    }
    else {
      alert("Unexpected Error\n" + error);
    }
  }

  // Wrapper for promises
  // Call a function as `this.withCatch(this.functionName());` to use main error handler
  private async withCatch<T>(promise: Promise<T>): Promise<T | void> {
    return promise.catch(err => this.handleError(err));
  }

  constructor(private imagePasser: ImagePasser,
    private readonly cd: ChangeDetectorRef) { }

  deviceId?: string;
  currentDevice?: string;
  showDevices: boolean = false;
  webcamPermission: boolean = false;
  camOn: boolean = false;

  mediaDevices: Array<MediaDeviceInfo> = []
  mediaStream!: MediaStream;

  //Call these functions via buttons on the HTML page

  //Callable Request/check permission of the browser for webcam access
  public checkPermission() {
    this.withCatch(this.requestCameraPermissions());
    this.withCatch(this.setMediaDevices());
    this.cd.detectChanges();
  }

  //Callable enumeration of webcam devices into mediaDevices Array
  public chooseDevice() {
    this.withCatch(this.setMediaDevices());
    this.showDevices = !this.showDevices;
    this.cd.detectChanges();
  }

  //disable this function for multi-cam support
  //Callable switch current active webcam (only works on firefox right now)
  public selectDevice(device: MediaDeviceInfo) {
    this.deviceId = device.deviceId;
    this.showDevices = false;
    if (this.camOn) { this.startCam(); }
    console.log(this.deviceId);
    this.currentDevice = device.label;
    console.log(this.currentDevice);
    this.cd.detectChanges();
  }
  //enable this function for multi-cam support
  //Callable Starts the stream of a new webcam to switch video input
  // async startStream(deviceId: string, label: string, videoElement: HTMLVideoElement) {
  //   if(this.mediaStream){this.closeStream()};
  //   const constraints: MediaStreamConstraints = {
  //     video: {
  //       deviceId: { exact: deviceId }
  //     },
  //     audio: false
  //   };

  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     videoElement.srcObject = stream;
  //     this.camOn = true;
  //     this.currentDevice = label;
  //   } catch (error) { throw (error); }
  //   this.cd.detectChanges();
  // }

  //Callable start camera function
  public startCam() {
    this.withCatch(this.startStreaming());
    this.camOn = true;
    this.cd.detectChanges();
  }

  //Callable stop camera function
  public stopCam() {
    this.closeStream();
    this.camOn = false;
    this.cd.detectChanges();
  }

  //Callable camera capture function
  public capCam() {
    this.withCatch(this.captureCamera());
  }

  capturedImageDataUrl?: string;
  capturedImageBlob?: Blob;

  //grabs a frame from the camera and puts in on the page
  private async captureCamera(): Promise<Blob> {
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

  //Waits till video is there to do do anything
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

  //converts the canvas picture to a Blob type
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

  //Attempts to get camera permission by starting the camera temprorarily
  private async requestCameraPermissions() {
    try {
      console.log("Camera Permission request");
      const constraints = { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // let tracks: Array<MediaStreamTrack> = stream.getTracks();
      // for (let i = 0; i < tracks.length; i++) {
      //   const track = tracks[i];
      //   track.stop();
      // } //replaced by the line below (try this if other doesn't work)
      stream.getTracks().forEach(track => track.stop());
      console.log("Camera permission granted");
      this.webcamPermission = true;
      this.cd.detectChanges();
      await this.setMediaDevices();
    } catch (err: any) {
      this.webcamPermission = false;
      throw (err);
    }
  }

  //Puts all the viable video media devices into an array mediaDevices
  private async setMediaDevices() {
    try {
      let allDevices = await navigator.mediaDevices.enumerateDevices();
      this.mediaDevices = new Array();
      for (let i = 0; i < allDevices.length; i++) {
        let device = allDevices[i];
        if (device.kind == 'videoinput') {
          this.mediaDevices.push(device);
        }
      }
      this.cd.detectChanges();
    }
    catch (err) {
      throw (err);
    }
  }

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  //Starts the video element
  private async startStreaming() {
    if (this.mediaStream) {
      this.closeStream(this.mediaStream);
    }
    try {
      this.mediaStream = await this.getSelectedDeviceMediaStream();
      //put this into html page to show webcam
      /*<video id="videoElement" #videoElement />*/
      this.videoElement.nativeElement.srcObject = this.mediaStream;
      this.videoElement.nativeElement.play();
      console.log("Camera Started");
      this.cd.detectChanges();
    }
    catch (err) {
      throw (err);
      console.error("Camera start error", err);
      alert("Cannot start camera\n" + err);
    }
  }

  //Stops the video element
  private closeStream(stream: MediaStream = this.mediaStream) {
    stream.getTracks().forEach(track => track.stop());
    this.videoElement.nativeElement.srcObject = null;
    console.log("Camera Closed");
  }

  //Returns a MediaStream of the first device in mediaDevices
  private async getSelectedDeviceMediaStream(): Promise<MediaStream> {
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
    this.cd.detectChanges();
    return stream;
  }
}
