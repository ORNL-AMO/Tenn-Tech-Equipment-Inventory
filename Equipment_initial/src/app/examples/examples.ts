import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-examples',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './examples.html',
  styleUrls: ['./examples.css'],
})
export class Examples {
}
