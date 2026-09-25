import { Component, inject } from '@angular/core';
import { AisuiteNgtoolsComponent, LanguageService, LinScePipe } from '@aisuite-eu/ngtools';
import { DemoCard } from '../shared/demo-card';

@Component({
  selector: 'app-linsce-page',
  imports: [DemoCard, AisuiteNgtoolsComponent, LinScePipe],
  templateUrl: './linsce.page.html'
})
export class LinscePage {
  protected readonly language = inject(LanguageService);
  protected readonly tags = ['Greeting', 'Farewell', 'UnknownTag'];
}
