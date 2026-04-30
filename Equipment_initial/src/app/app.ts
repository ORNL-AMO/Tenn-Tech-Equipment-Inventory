import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { Header } from './header/header';
import { Inventory } from './inventory/inventory';
import { OCRComponent } from './ocr/ocr.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OCRComponent, MatTabsModule, Header, Inventory],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('MEASUR Proof of Concept');
}
