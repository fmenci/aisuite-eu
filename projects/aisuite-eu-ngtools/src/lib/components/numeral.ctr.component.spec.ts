import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NumeralInputComponent } from './numeral.ctr.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-numeral-input> rely on.
 * The control is a ControlValueAccessor exchanging a number with the form, displayed with `doppo` decimals and
 * emitted rounded to `doppo + storedp` decimals. It reads the decimal separator from the global variable
 * `decimalpoint`, which the hosting page must define (see index.html).
 */

@Component({
  template: `<ais-numeral-input [formControl]="ctrl" [doppo]="doppo" [storedp]="storedp" [small]="small" [placeholder]="placeholder" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NumeralInputComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<number>(0, { nonNullable: true });
  doppo = 2;
  storedp = 1;
  small = false;
  placeholder = '';
}

describe('NumeralInputComponent', () => {
  const globals = globalThis as unknown as { decimalpoint?: string };
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let input: HTMLInputElement;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const type = (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const press = (key: string) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });
    input.dispatchEvent(event);
    return event;
  };

  beforeEach(async () => {
    globals.decimalpoint = ',';
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
    input = fixture.nativeElement.querySelector('input');
  });

  afterEach(() => {
    delete globals.decimalpoint;
  });

  it('is the standalone component <ais-numeral-input> with inputs doppo, storedp, small, placeholder and disabled', () => {
    const mirror = reflectComponentType(NumeralInputComponent)!;
    expect(mirror.selector).toBe('ais-numeral-input');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(
      expect.arrayContaining(['doppo', 'storedp', 'small', 'placeholder', 'disabled']));
  });

  it('defaults to 2 displayed decimals and 1 more stored', () => {
    const numeral = fixture.debugElement.children[0].componentInstance as NumeralInputComponent;
    expect(numeral.doppo).toBe(2);
    expect(numeral.storedp).toBe(1);
  });

  it('displays the number written by the form with doppo decimals and the decimalpoint separator', async () => {
    host.ctrl.setValue(12.5);
    await settle();
    expect(input.value).toBe('12,50');

    host.doppo = 3;
    await settle();
    host.ctrl.setValue(0.25);
    await settle();
    expect(input.value).toBe('0,250');
  });

  it('falls back on "." when the page defines no decimalpoint', async () => {
    delete globals.decimalpoint;
    host.ctrl.setValue(12.5);
    await settle();
    expect(input.value).toBe('12.50');

    type('3.7');
    await settle();
    expect(host.ctrl.value).toBe(3.7);
  });

  it('displays 0 when the form holds zero', () => {
    expect(input.value).toBe('0');
  });

  it('gives the form a number when the user types one', async () => {
    type('42');
    await settle();
    expect(host.ctrl.value).toBe(42);
  });

  it('accepts the decimalpoint separator when typing', async () => {
    type('3,7');
    await settle();
    expect(host.ctrl.value).toBe(3.7);
  });

  it('rounds what it gives the form to doppo + storedp decimals', async () => {
    type('1.23456');
    await settle();
    expect(host.ctrl.value).toBe(1.235);

    host.storedp = 0;
    await settle();
    type('1.23456');
    await settle();
    expect(host.ctrl.value).toBe(1.23);
  });

  it('gives the form 0 when the typed text is not a number', async () => {
    host.ctrl.setValue(5);
    await settle();
    type('abc');
    await settle();
    expect(host.ctrl.value).toBe(0);
  });

  it('marks the form control touched on focus and on blur', () => {
    expect(host.ctrl.touched).toBe(false);
    input.dispatchEvent(new Event('focus'));
    expect(host.ctrl.touched).toBe(true);

    host.ctrl.markAsUntouched();
    input.dispatchEvent(new Event('blur'));
    expect(host.ctrl.touched).toBe(true);
  });

  it('steps the value by one with the left and right arrows', async () => {
    host.ctrl.setValue(5);
    await settle();

    press('ArrowRight');
    await settle();
    expect(host.ctrl.value).toBe(6);
    expect(input.value).toBe('6,00');

    press('ArrowLeft');
    press('ArrowLeft');
    await settle();
    expect(host.ctrl.value).toBe(4);
  });

  it('does not submit the surrounding form on Enter', () => {
    expect(press('Enter').defaultPrevented).toBe(true);
  });

  it('follows the disabled state of the form control, dimming itself', async () => {
    const element: HTMLElement = fixture.nativeElement.querySelector('ais-numeral-input');
    host.ctrl.disable();
    await settle();
    expect(input.disabled).toBe(true);
    expect(element.style.opacity).toBe('0.25');

    host.ctrl.enable();
    await settle();
    expect(input.disabled).toBe(false);
    expect(element.style.opacity).toBe('1');
  });

  it('relays the small and placeholder inputs to the text input', async () => {
    expect(input.type).toBe('text');
    expect(input.classList).not.toContain('form-control-sm');

    host.small = true;
    host.placeholder = 'amount';
    await settle();

    expect(input.classList).toContain('form-control-sm');
    expect(input.placeholder).toBe('amount');
  });
});
