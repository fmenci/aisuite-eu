import { Component, computed, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  amountValidator, compressIdValidator, EMPTYGUID, EMPTYID, guidValidator, notEmptyCompressIdValidator, notEmptyGuidValidator
} from '@aisuite-eu/ngtools';
import { DemoCard } from '../shared/demo-card';

const VALIDATORS = { compressIdValidator, notEmptyCompressIdValidator, guidValidator, notEmptyGuidValidator, amountValidator };

@Component({
  selector: 'app-helpers-page',
  imports: [DemoCard],
  templateUrl: './helpers.page.html'
})
export class HelpersPage {
  protected readonly text = signal('');
  protected readonly samples = [EMPTYID, EMPTYGUID, 'not an id', '12.50'];
  protected readonly results = computed(() => {
    const control = new FormControl(this.text());
    return Object.entries(VALIDATORS).map(([name, validator]) => ({
      name,
      errors: Object.keys(validator(control) ?? {})
    }));
  });

  protected onInput(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
  }
}
