import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CurrencyInputComponent, DateInputComponent, IconTypeInputComponent, LimitsModel,
  LimitSliderComponent, NumeralInputComponent
} from '@aisuite-eu/ngtools';
import { DemoCard } from '../shared/demo-card';

@Component({
  selector: 'app-inputs-page',
  imports: [
    ReactiveFormsModule, JsonPipe, DemoCard, CurrencyInputComponent, DateInputComponent,
    IconTypeInputComponent, LimitSliderComponent, NumeralInputComponent
  ],
  templateUrl: './inputs.page.html'
})
export class InputsPage {
  protected readonly form = new FormGroup({
    amount: new FormControl(1234.5, { nonNullable: true }),
    currency: new FormControl(0, { nonNullable: true }),
    day: new FormControl<Date | undefined>(new Date(), { nonNullable: true }),
    iconType: new FormControl(2, { nonNullable: true }),
    temperature: new FormControl(20, { nonNullable: true })
  });
  protected readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly temperatureLimits = new LimitsModel(
    'Temperature (°C)', -10, 0, 20, 40, 60, 1, 1,
    'physical limit ({0} to {1})', 'Too cold, under {0}', 'Too hot, over {0}'
  );

  protected toggleDisabled(): void {
    if (this.form.enabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
