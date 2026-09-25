import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { Currency } from '../models/currency.enum';
import { CurrencyInputComponent } from './currency.ctr.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-currency-input> rely on.
 * The control is a ControlValueAccessor exchanging the Currency enum value (a number) with the form.
 */

@Component({
  template: `<ais-currency-input [formControl]="ctrl" [small]="small" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CurrencyInputComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<number | null>(Currency.EUR);
  small = false;
}

describe('CurrencyInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let select: HTMLSelectElement;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const choose = (value: string) => {
    select.value = value;
    select.dispatchEvent(new Event('change'));
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
    select = fixture.nativeElement.querySelector('select');
  });

  it('is the standalone component <ais-currency-input> with inputs small and disabled', () => {
    const mirror = reflectComponentType(CurrencyInputComponent)!;
    expect(mirror.selector).toBe('ais-currency-input');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(input => input.templateName)).toEqual(expect.arrayContaining(['small', 'disabled']));
  });

  it('offers one option per Currency member, valued by the enum number and labelled by its name', () => {
    const options = Array.from(select.options).map(option => [option.value, option.text.trim()]);
    expect(options).toEqual([['0', 'EUR'], ['1', 'CHF'], ['2', 'GBP'], ['3', 'JPY'], ['4', 'USD']]);
  });

  it('displays the value written by the form', async () => {
    expect(select.value).toBe(String(Currency.EUR));
    host.ctrl.setValue(Currency.JPY);
    await settle();
    expect(select.value).toBe(String(Currency.JPY));
  });

  it('shows the first currency (0) when the form holds no value', async () => {
    host.ctrl.setValue(Currency.USD);
    await settle();

    host.ctrl.setValue(null);
    await settle();
    expect(select.value).toBe(String(Currency.EUR));
  });

  it('shows the first currency (0) when the form is created without value', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.ctrl = new FormControl<number | null>(null);
    await settle();
    select = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe(String(Currency.EUR));
  });

  it('gives the form the enum number (not the text) when the user picks a currency', async () => {
    choose(String(Currency.USD));
    await settle();
    expect(host.ctrl.value).toBe(Currency.USD);
    expect(typeof host.ctrl.value).toBe('number');
  });

  it('marks the form control touched when it gets the focus', () => {
    expect(host.ctrl.touched).toBe(false);
    select.dispatchEvent(new Event('focus'));
    expect(host.ctrl.touched).toBe(true);
  });

  it('marks the form control touched when a currency is chosen', () => {
    choose(String(Currency.CHF));
    expect(host.ctrl.touched).toBe(true);
  });

  it('follows the disabled state of the form control, dimming itself', async () => {
    const element: HTMLElement = fixture.nativeElement.querySelector('ais-currency-input');
    host.ctrl.disable();
    await settle();
    expect(select.disabled).toBe(true);
    expect(element.style.opacity).toBe('0.25');

    host.ctrl.enable();
    await settle();
    expect(select.disabled).toBe(false);
    expect(element.style.opacity).toBe('1');
  });

  it('shrinks with the small input', async () => {
    expect(select.classList).not.toContain('form-control-sm');
    host.small = true;
    await settle();
    expect(select.classList).toContain('form-control-sm');
  });

  it('does not submit the surrounding form on Enter', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    select.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
