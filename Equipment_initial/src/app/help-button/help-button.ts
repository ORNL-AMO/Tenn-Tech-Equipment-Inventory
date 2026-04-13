import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-help-button',
  imports: [CommonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule],
  templateUrl: './help-button.html',
  styleUrl: './help-button.css',
})
export class HelpButtonDialog {
  
}
