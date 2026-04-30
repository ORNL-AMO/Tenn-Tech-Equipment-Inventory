import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  imports: [NgOptimizedImage, MatToolbarModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  logoUrl = '/assets/measure-app-icon.png';
  logoAlt = 'Measure Logo';
}
