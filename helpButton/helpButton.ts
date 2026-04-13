// If none of these work, use this in your terminal, Geo: 
// npm install @angular/material @angular/cdk"
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-scanner-help',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatExpansionModule, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './scanner-help.component.html',
  styleUrls: ['./scanner-help.component.css']
})
export class ScannerHelpComponent {}