import { Component, inject, signal } from '@angular/core';
import { AisuiteDokogedComponent, AisuiteDokogedService } from '@aisuite-eu/ngtools';
import { DEMO_XML_ROUTE } from '../mock/mock-backend.interceptor';
import { DemoCard } from '../shared/demo-card';

@Component({
  selector: 'app-doko-page',
  imports: [DemoCard, AisuiteDokogedComponent],
  templateUrl: './doko.page.html'
})
export class DokoPage {
  private readonly ged = inject(AisuiteDokogedService);
  protected readonly received = signal<string[]>([]);

  constructor() {
    this.ged.evdokoOK.subscribe((body: string) => this.received.update(list => [...list, body]));
  }

  protected open(): void {
    this.ged.open(true, DEMO_XML_ROUTE);
  }
}
