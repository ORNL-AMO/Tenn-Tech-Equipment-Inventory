import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [NgOptimizedImage],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  logoUrl = '/assets/measure-app-icon.png';
  logoAlt = 'Measure Logo';
}
