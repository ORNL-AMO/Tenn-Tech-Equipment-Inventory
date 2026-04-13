import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { Header } from './header/header';
import { History } from './history/history';
import { OCRComponent } from './ocr/ocr.component';
import { HelpButton } from './help-button/help-button';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OCRComponent, MatTabsModule, Header, History, HelpButton],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('MEASUR Proof of Concept');
}
