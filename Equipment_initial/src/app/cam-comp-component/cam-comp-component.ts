import { Component } from '@angular/core';

@Component({
  selector: 'app-cam-comp-component',
  imports: [],
  templateUrl: './cam-comp-component.html',
  styleUrl: './cam-comp-component.css'
})
export class CamCompComponent {

  permissionStatus : string= '';
  camData : any = null;
  capturedImage : any = '';
  trigger : Subject<void> = new Subject();

  get $trigger(): Observable<void>{
    return this.trigger.asObservable();
  }

  checkPermission(){
    navigator.mediaDevices.getUserMedia({video:{width:500,height:500}}).then((response)=>{
      this.permissionStatus = 'Allowed';
      this.camData = response;
      console.log(this.camData);
    }).catch(err=>{
      this.permissionStatus = 'Not Allowed';
      console.log(this.permissionStatus);
    })
  }

  capture(event : WebcamImage){
    // console.log("clicked");
    console.log("event",event); // img details
    this.capturedImage = event.imageAsDataUrl;
  }

  captureImage(){
    this.trigger.next();
  }
}
