import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { DateInputComponent } from './date.ctr.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-datectr-input> rely on.
 * The control is a ControlValueAccessor exchanging a Date with the form, displayed by a native date input.
 */

@Component({
  template: `<ais-datectr-input [formControl]="ctrl" [small]="small" [placeholder]="placeholder" [required]="required" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DateInputComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<Date | undefined>(new Date(2026, 0, 31));
  small = false;
  placeholder = '';
  required = false;
}

describe('DateInputComponent', () => {
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

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
    input = fixture.nativeElement.querySelector('input');
  });

  it('is the standalone component <ais-datectr-input> with inputs small, placeholder, disabled and required', () => {
    const mirror = reflectComponentType(DateInputComponent)!;
    expect(mirror.selector).toBe('ais-datectr-input');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(
      expect.arrayContaining(['small', 'placeholder', 'disabled', 'required']));
  });

  it('is a native date input', () => {
    expect(input.type).toBe('date');
  });

  it('displays the Date written by the form as yyyy-MM-dd, in local time', async () => {
    expect(input.value).toBe('2026-01-31');
    host.ctrl.setValue(new Date(2027, 10, 5));
    await settle();
    expect(input.value).toBe('2027-11-05');
  });

  it('displays nothing when the form holds no date', async () => {
    host.ctrl.setValue(undefined);
    await settle();
    expect(input.value).toBe('');
  });

  it('gives the form a Date when the user types one', async () => {
    type('2026-03-15');
    await settle();
    const value = host.ctrl.value as Date;
    expect(value).toBeInstanceOf(Date);
    expect(value.getTime()).toBe(new Date('2026-03-15').getTime());
  });

  it('marks the form control touched on focus and on blur', () => {
    expect(host.ctrl.touched).toBe(false);
    input.dispatchEvent(new Event('focus'));
    expect(host.ctrl.touched).toBe(true);

    host.ctrl.markAsUntouched();
    input.dispatchEvent(new Event('blur'));
    expect(host.ctrl.touched).toBe(true);
  });

  it('follows the disabled state of the form control, dimming itself', async () => {
    const element: HTMLElement = fixture.nativeElement.querySelector('ais-datectr-input');
    host.ctrl.disable();
    await settle();
    expect(input.disabled).toBe(true);
    expect(element.style.opacity).toBe('0.25');

    host.ctrl.enable();
    await settle();
    expect(input.disabled).toBe(false);
    expect(element.style.opacity).toBe('1');
  });

  it('relays the small, placeholder and required inputs to the date input', async () => {
    expect(input.classList).not.toContain('form-control-sm');
    expect(input.required).toBe(false);

    host.small = true;
    host.placeholder = 'pick a day';
    host.required = true;
    await settle();

    expect(input.classList).toContain('form-control-sm');
    expect(input.placeholder).toBe('pick a day');
    expect(input.required).toBe(true);
  });

  it('does not submit the surrounding form on Enter', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
