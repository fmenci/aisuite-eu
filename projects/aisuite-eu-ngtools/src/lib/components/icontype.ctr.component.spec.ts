import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { IconTypeEnum } from '../models/icontype.enum';
import { IconTypeInputComponent } from './icontype.ctr.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-icontype-input> rely on.
 * The control is a ControlValueAccessor exchanging the IconTypeEnum value (a number) with the form.
 */

@Component({
  template: `<ais-icontype-input [formControl]="ctrl" [small]="small" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IconTypeInputComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<number | null>(IconTypeEnum.none);
  small = false;
}

describe('IconTypeInputComponent', () => {
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

  it('is the standalone component <ais-icontype-input> with inputs small and disabled', () => {
    const mirror = reflectComponentType(IconTypeInputComponent)!;
    expect(mirror.selector).toBe('ais-icontype-input');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(input => input.templateName)).toEqual(expect.arrayContaining(['small', 'disabled']));
  });

  it('offers one option per IconTypeEnum member, valued by the enum number and labelled by its name', () => {
    const options = Array.from(select.options).map(option => [option.value, option.text.trim()]);
    expect(options).toEqual([
      ['0', 'none'], ['1', 'imageTag'], ['2', 'fontawesome'], ['3', 'iconografia'], ['4', 'svg'], ['5', 'doko'], ['6', 'dokoSvg'],
    ]);
  });

  it('displays the value written by the form', async () => {
    expect(select.value).toBe(String(IconTypeEnum.none));
    host.ctrl.setValue(IconTypeEnum.svg);
    await settle();
    expect(select.value).toBe(String(IconTypeEnum.svg));
  });

  it('shows the first icon type (none, 0) when the form holds no value', async () => {
    host.ctrl.setValue(IconTypeEnum.svg);
    await settle();

    host.ctrl.setValue(null);
    await settle();
    expect(select.value).toBe(String(IconTypeEnum.none));
  });

  it('shows the first icon type (none, 0) when the form is created without value', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.ctrl = new FormControl<number | null>(null);
    await settle();
    select = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe(String(IconTypeEnum.none));
  });

  it('gives the form the enum number (not the text) when the user picks an icon type', async () => {
    choose(String(IconTypeEnum.doko));
    await settle();
    expect(host.ctrl.value).toBe(IconTypeEnum.doko);
    expect(typeof host.ctrl.value).toBe('number');
  });

  it('marks the form control touched when it gets the focus', () => {
    expect(host.ctrl.touched).toBe(false);
    select.dispatchEvent(new Event('focus'));
    expect(host.ctrl.touched).toBe(true);
  });

  it('marks the form control touched when an icon type is chosen', () => {
    choose(String(IconTypeEnum.fontawesome));
    expect(host.ctrl.touched).toBe(true);
  });

  it('follows the disabled state of the form control, dimming itself', async () => {
    const element: HTMLElement = fixture.nativeElement.querySelector('ais-icontype-input');
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
