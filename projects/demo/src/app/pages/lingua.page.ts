import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FlagButtonComponent, LinguaControlComponent } from '@aisuite-eu/ngtools';
import { DemoCard } from '../shared/demo-card';

@Component({
  selector: 'app-lingua-page',
  imports: [ReactiveFormsModule, DemoCard, FlagButtonComponent, LinguaControlComponent],
  templateUrl: './lingua.page.html'
})
export class LinguaPage {
  protected readonly lingua = new FormControl('en', { nonNullable: true });
  protected readonly active = signal('en');
  protected readonly codes = ['en', 'fr', 'de', 'it', 'es'];
}
