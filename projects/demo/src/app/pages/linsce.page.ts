import { Component, inject, signal } from '@angular/core';
import { AisuiteNgtoolsComponent, FlagButtonComponent, LanguageService, LinScePipe } from '@aisuite-eu/ngtools';
import { demoLabels } from '../mock/demo-data';
import { DemoCard } from '../shared/demo-card';

@Component({
  selector: 'app-linsce-page',
  imports: [DemoCard, AisuiteNgtoolsComponent, FlagButtonComponent, LinScePipe],
  templateUrl: './linsce.page.html'
})
export class LinscePage {
  private readonly service = inject(LanguageService);
  protected readonly lingua = signal(this.service.operationLingua);
  protected readonly codes = ['en', 'fr', 'de', 'it', 'es'];
  protected readonly tags = ['Greeting', 'Farewell', 'GedModalTitle', 'UnknownTag'];

  /** As the application does when the user picks a language: the server sends the labels of that language */
  protected switchLingua(lingua: string): void {
    this.service.switchLingua(lingua, demoLabels(lingua));
    this.lingua.set(lingua);
  }
}
