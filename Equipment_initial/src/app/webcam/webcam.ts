import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-webcam',
  imports: [CommonModule],
  templateUrl: './webcam.html',
  styleUrl: './webcam.css',
})
export class Webcam {
  deviceId?: string;
  currentDevice?: string;
  showDevices: boolean = false;
  webcamPermission: boolean = false;
  camOn: boolean = false;

  //Call these functions via buttons on the HTML page
  checkPermission() {
    this.requestCameraPermissions();
    this.setMediaDevices();
    this.webcamPermission = true;
  }
  chooseDevice() {
    this.setMediaDevices();
    this.showDevices = !this.showDevices;
  }
  selectDevice(device: MediaDeviceInfo) {
    this.deviceId = device.deviceId;
    this.showDevices = false;
    if (this.camOn) {this.startCam();}
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
