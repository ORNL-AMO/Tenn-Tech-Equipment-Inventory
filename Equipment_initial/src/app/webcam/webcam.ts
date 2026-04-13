import { Component, ElementRef, ViewChild, ChangeDetectorRef, output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { GenericErrorDialog } from '../error.dialog';


@Component({
  selector: 'app-webcam',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule],
  templateUrl: './webcam.html',
  styleUrl: './webcam.css',
})

export class Webcam {
  private dialog = inject(MatDialog);

  // Centralized error handler
  private handleError(error: any) {
    console.error('An error occurred:', error);
    if (error.name == "NotReadableError") {
      this.dialog.open(GenericErrorDialog, {
        data: {
          title: 'Camera Not Detected',
          message: "Could not confirm camera presence.\nMake sure main camera is not in use.\nMake sure camera is on."
        }
      });
    }
    else if (error.name == "NotAllowedError") {
      this.dialog.open(GenericErrorDialog, {
        data: {
          title: 'Camera Permission Denied',
          message: "Camera permission is denied.\nPlease allow camera to use this function."
        }
      });
    }
    else if (error.name == "AbortError") {
      this.dialog.open(GenericErrorDialog, {
        data: {
          title: 'Camera Not Accessible',
          message: "Could not open camera.\nAnother application may be using it already."
        }
      });
    }
    else {
      this.dialog.open(GenericErrorDialog, {
        data: {
          title: 'An Unexpected Error Occurred',
          message: "Unexpected Error\n" + error
        }
      });
    }
  }

  // Wrapper for promises
  // Call a function as `this.withCatch(this.functionName());` to use main error handler
  private async withCatch<T>(promise: Promise<T>): Promise<T | void> {
    return promise.catch(err => this.handleError(err));
  }

  constructor(private readonly cd: ChangeDetectorRef) { }

  webcamPermission: boolean = false;
  camOn: boolean = false;
  selectedDevice?: MediaDeviceInfo;

  mediaDevices: Array<MediaDeviceInfo> = []
  mediaStream!: MediaStream;

  //Call these functions via buttons on the HTML page

  //Callable Request/check permission of the browser for webcam access
  public checkPermission() {
    this.withCatch(this.requestCameraPermissions());
    this.withCatch(this.setMediaDevices());
    this.selectedDevice = this.mediaDevices[0];
    this.cd.detectChanges();
  }

  //Callable switch current active webcam
  public selectDevice(device: MediaDeviceInfo) {
    this.selectedDevice = device;
    if (this.camOn) { this.startCam(); }
    console.log(this.selectedDevice, "Camera selected");
    this.cd.detectChanges();
  }

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
    this.captureCamera();
  }

  fileSelected = output<{ target: { files: File[] } }>();
  //grabs a frame from the camera and puts in on the page
  private async captureCamera() {
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

    canvas.toBlob((blob) => {
      if (blob) {
        // Append timestamp to filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `capture-${timestamp}.png`;



        const file = new File([blob], filename, { type: 'image/png' });
        this.fileSelected.emit({ target: { files: [file] } });
      }
    }, 'image/png');
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


  //Attempts to get camera permission by starting the camera temprorarily
  private async requestCameraPermissions() {
    try {
      console.log("Camera Permission request");
      const constraints = { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      await this.setMediaDevices();
      console.log("Camera permission granted");
      this.webcamPermission = true;
      this.cd.detectChanges();
    } catch (err: any) {
      this.webcamPermission = false;
      throw (err);
    }
  }

  // Puts all the viable video media devices into an array mediaDevices
  // Call only once, or it resets the saved list of media devices
  private async setMediaDevices() {
    try {
      let allDevices = await navigator.mediaDevices.enumerateDevices();
      // this.mediaDevices = new Array();
      // for (let i = 0; i < allDevices.length; i++) {
      //   let device = allDevices[i];
      //   if (device.kind == 'videoinput') {
      //     this.mediaDevices.push(device);
      //   }
      // }
      this.mediaDevices = [];
      allDevices.forEach(device => { //only grab video inputs, no other types
        if (device.kind == 'videoinput') { this.mediaDevices.push(device) }
      });
      this.cd.detectChanges();
    }
    catch (err) {
      throw (err);
    }
  }

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  //Starts the video element
  private async startStreaming() {
    if (this.mediaStream) { this.closeStream(this.mediaStream); }
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
    }
  }

  //Stops the video element
  private closeStream(stream: MediaStream = this.mediaStream) {
    stream.getTracks().forEach(track => track.stop());
    this.videoElement.nativeElement.srcObject = null;
    console.log("Camera Closed");
  }

  //Returns a MediaStream of the selected or first device in mediaDevices
  private async getSelectedDeviceMediaStream(): Promise<MediaStream> {
    let webcamDevice;
    if (this.mediaDevices.length > 0) {
      if (this.selectedDevice) { //Choose selectedDevice
        webcamDevice = this.mediaDevices.find(device => device === this.selectedDevice);
      } else {
        //if no device has been selected, choose first in list
        webcamDevice = this.mediaDevices[0];
        this.selectedDevice = webcamDevice;
      }
    } else { throw new Error("No Devices Available"); }

    if (!webcamDevice) { throw new Error('Webcam not found'); }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: webcamDevice.deviceId } }
    });
    this.cd.detectChanges();
    return stream;
  }
}
