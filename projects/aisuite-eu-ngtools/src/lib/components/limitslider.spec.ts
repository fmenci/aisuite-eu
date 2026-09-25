import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LimitsModel } from '../models/limits.model';
import { LimitSliderComponent } from './limitslider';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-limitslider> rely on.
 * The control is a ControlValueAccessor exchanging a number with the form. It shows a range and a text box kept
 * in sync, drawn from a LimitsModel:
 *  - [lowband, highband] is the span of the range, out of it the value raises an alarm,
 *  - [lowno, highno] is the span accepted once the text box is left,
 *  - [minuilimit, maxuilimit] raises the "physical limit" alarm.
 * It reads the decimal separator from the global variable `decimalpoint`, which the hosting page must define.
 */

const LIMITS = new LimitsModel('Temp', 0, 10, 20, 30, 40, 1, 1, 'phys {0}-{1}', 'too low {0}', 'too high {0}', 1);

@Component({
  template: `<ais-limitslider [formControl]="ctrl" [limits]="limits" [minuilimit]="minui" [maxuilimit]="maxui" [small]="small" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [LimitSliderComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<number>(20, { nonNullable: true });
  limits = LIMITS;
  minui = 0;
  maxui = Infinity;
  small = false;
}

describe('LimitSliderComponent', () => {
  const globals = globalThis as unknown as { decimalpoint?: string };
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let range: HTMLInputElement;
  let box: HTMLInputElement;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const type = (value: string) => {
    box.value = value;
    box.dispatchEvent(new Event('input'));
  };
  const press = (key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    box.dispatchEvent(event);
    return event;
  };
  const alarm = () => fixture.nativeElement.querySelector('.limitslider-alarm') as Element | null;
  const alarmMessage = () => fixture.nativeElement.querySelector('.limitslider-alarm-message')?.textContent?.trim();

  beforeEach(async () => {
    globals.decimalpoint = ',';
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
    range = fixture.nativeElement.querySelector('input[type=range]');
    box = fixture.nativeElement.querySelector('input[type=text]');
  });

  afterEach(() => {
    delete globals.decimalpoint;
  });

  it('is the standalone component <ais-limitslider> with its inputs', () => {
    const mirror = reflectComponentType(LimitSliderComponent)!;
    expect(mirror.selector).toBe('ais-limitslider');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(
      expect.arrayContaining(['small', 'disabled', 'limits', 'minuilimit', 'maxuilimit']));
  });

  it('has default limits, and no ui limit', () => {
    const slider = TestBed.createComponent(LimitSliderComponent).componentInstance;
    expect(slider.limits).toMatchObject({
      name: 'slider', lowno: 0, lowband: 250, nominal: 1500, highband: 10000, highno: Infinity,
      decimalaccuracy: 2, storeprecision: 1,
      limitPhysicMessage: 'physical limit ({0} to {1})',
      alertlow: 'Limit low is reached {0}',
      alerthigh: 'Limit high is exceeded {0}',
    });
    expect(slider.minuilimit).toBe(0);
    expect(slider.maxuilimit).toBe(Infinity);
  });

  it('is labelled with the limits name', () => {
    expect(fixture.nativeElement.querySelector('.limitslider-label').textContent).toBe('Temp');
  });

  it('draws the range from the limits bands and step', () => {
    expect(range.min).toBe('10');
    expect(range.max).toBe('30');
    expect(range.step).toBe('1');
  });

  it('computes the range step from the bands when the limits give none', async () => {
    host.limits = new LimitsModel('Wide', 0, 0, 500, 1000, 1000, 0, 0, 'phys', 'low', 'high');
    await settle();
    expect(range.step).toBe('10');
  });

  it('displays the value written by the form in the text box, with the decimalpoint separator, and on the range', async () => {
    expect(box.value).toBe('20,0');
    expect(range.value).toBe('20');

    host.ctrl.setValue(15);
    await settle();
    expect(box.value).toBe('15,0');
    expect(range.value).toBe('15');
  });

  it('falls back on "." when the page defines no decimalpoint', async () => {
    delete globals.decimalpoint;
    host.ctrl.setValue(15);
    await settle();
    expect(box.value).toBe('15.0');

    type('25.5');
    await settle();
    expect(host.ctrl.value).toBe(25.5);
  });

  it('gives the form a number when the user types one, accepting the decimalpoint separator', async () => {
    type('25,5');
    await settle();
    expect(host.ctrl.value).toBe(25.5);
  });

  it('gives the form the value chosen on the range, and shows it in the text box', async () => {
    range.value = '15';
    range.dispatchEvent(new Event('input'));
    await settle();
    expect(host.ctrl.value).toBe(15);
    expect(box.value).toBe('15,0');
  });

  it('keeps the range inside the bands when a value out of them is typed, the form gets the typed value', async () => {
    type('5');
    await settle();
    expect(host.ctrl.value).toBe(5);
    expect(range.value).toBe('10');

    type('35');
    await settle();
    expect(host.ctrl.value).toBe(35);
    expect(range.value).toBe('30');
  });

  it('brings a typed value back in [lowno, highno] once the text box is left', async () => {
    type('55');
    box.dispatchEvent(new Event('blur'));
    await settle();
    expect(host.ctrl.value).toBe(40);
    expect(box.value).toBe('40,0');

    type('-5');
    box.dispatchEvent(new Event('blur'));
    await settle();
    expect(host.ctrl.value).toBe(0);
  });

  it('marks the form control touched on focus, on blur and when the range is released', () => {
    expect(host.ctrl.touched).toBe(false);
    box.dispatchEvent(new Event('focus'));
    expect(host.ctrl.touched).toBe(true);

    host.ctrl.markAsUntouched();
    box.dispatchEvent(new Event('blur'));
    expect(host.ctrl.touched).toBe(true);

    host.ctrl.markAsUntouched();
    range.dispatchEvent(new Event('mouseup'));
    expect(host.ctrl.touched).toBe(true);
  });

  describe('alarm', () => {
    it('is off inside the bands', () => {
      expect(alarm()).toBeNull();
      expect(alarmMessage()).toBeUndefined();
    });

    it('is raised below lowband with the alertlow message', async () => {
      host.ctrl.setValue(5);
      await settle();
      expect(alarm()).not.toBeNull();
      expect(alarmMessage()).toBe('too low 10,0');
    });

    it('is raised above highband with the alerthigh message', async () => {
      host.ctrl.setValue(35);
      await settle();
      expect(alarm()).not.toBeNull();
      expect(alarmMessage()).toBe('too high 30,0');
    });

    it('is raised on the ui limits with the physical limit message', async () => {
      host.minui = 12;
      host.maxui = 25;
      host.ctrl.setValue(12);
      await settle();
      expect(alarm()).not.toBeNull();
      expect(alarmMessage()).toBe('phys 12,0-25,0');
    });
  });

  describe('keyboard', () => {
    it('sets the nominal value on space', async () => {
      host.ctrl.setValue(30);
      await settle();
      press(' ');
      await settle();
      expect(host.ctrl.value).toBe(20);
    });

    it('jumps to highband on arrow up and to lowband on arrow down', async () => {
      press('ArrowUp');
      await settle();
      expect(host.ctrl.value).toBe(30);

      press('ArrowDown');
      await settle();
      expect(host.ctrl.value).toBe(10);
    });

    it('steps the value with the left and right arrows', async () => {
      press('ArrowRight');
      press('ArrowRight');
      await settle();
      expect(host.ctrl.value).toBe(22);

      press('ArrowLeft');
      await settle();
      expect(host.ctrl.value).toBe(21);
    });

    it('does not step out of [lowno, highno]', async () => {
      host.ctrl.setValue(40);
      await settle();
      press('ArrowRight');
      await settle();
      expect(host.ctrl.value).toBe(40);

      host.ctrl.setValue(0);
      await settle();
      press('ArrowLeft');
      await settle();
      expect(host.ctrl.value).toBe(0);
    });

    it('does not submit the surrounding form on Enter', () => {
      expect(press('Enter').defaultPrevented).toBe(true);
    });
  });

  it('follows the disabled state of the form control', async () => {
    host.ctrl.disable();
    await settle();
    expect(range.disabled).toBe(true);
    expect(box.disabled).toBe(true);

    host.ctrl.enable();
    await settle();
    expect(range.disabled).toBe(false);
    expect(box.disabled).toBe(false);
  });

  it('shrinks the text box and the range with the small input', async () => {
    expect(box.classList).not.toContain('form-control-sm');
    host.small = true;
    await settle();
    expect(box.classList).toContain('form-control-sm');
    expect(range.classList).toContain('form-control-sm');
  });
});
