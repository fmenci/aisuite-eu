import { inject, Service } from '@angular/core';
import { AisuiteSelectModel, LivelyListDirective } from '@aisuite-eu/ngtools';
import { DEMO_LISTS } from './demo-data';

/** Answers the list requests of the selectors, as the application does with its own data source */
@Service()
export class DemoListsService {
  private lively = inject(LivelyListDirective);

  constructor() {
    this.lively.evPull.subscribe((req: AisuiteSelectModel) =>
      this.lively.addcache(new AisuiteSelectModel(req.name, req.unicId, new Date(), DEMO_LISTS[req.name] ?? [])));
  }
}
