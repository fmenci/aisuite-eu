import { Component, input } from '@angular/core';

@Component({
  selector: 'app-demo-card',
  template: `
    <section class="card mb-4">
      <div class="card-header">
        <strong>{{ title() }}</strong>
        <code class="ms-2">{{ selector() }}</code>
      </div>
      <div class="card-body">
        @if (description()) {
          <p class="text-body-secondary">{{ description() }}</p>
        }
        <ng-content />
      </div>
    </section>
  `
})
export class DemoCard {
  readonly title = input.required<string>();
  readonly selector = input('');
  readonly description = input('');
}
