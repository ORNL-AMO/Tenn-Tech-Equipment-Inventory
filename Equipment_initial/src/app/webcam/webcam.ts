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
  showDevices: boolean = false;
  webcamPermission: boolean = false;
  camOn: boolean = false;
  
  checkPermission() {
    this.requestCameraPermissions();
    this.setMediaDevices();
  }
  chooseDevice() {
    this.setMediaDevices();
    this.showDevices = !this.showDevices;
  }
  selectDevice(device: MediaDeviceInfo) {
    this.deviceId=device.deviceId;
    this.showDevices = false;
    if(this.camOn){
      this.startCam();
    }
  }
  startCam() {
    this.startStreaming();
    this.camOn = true;
  }
  stopCam() {
    this.closeStream(this.mediaStream);
  }


  async requestCameraPermissions() {
    const constraints = { video: true, audio: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    let tracks: Array<MediaStreamTrack> = stream.getTracks();
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      track.stop();
    }
  }

  mediaDevices: Array<MediaDeviceInfo> = []
  async setMediaDevices() {
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    if(allDevices.length>2){
      this.webcamPermission = true;
    }
    else{
      this.webcamPermission = false;
    }
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
  }

  closeStream(stream: MediaStream) {
    let tracks: Array<MediaStreamTrack> = stream.getTracks();
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      track.stop;
    }
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
