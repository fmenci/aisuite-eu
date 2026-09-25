import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ILinguaFlag } from '../models/ilingua.flag';
import { ALLLIN, DEFAULT_FLAG, LanguageService } from '../services/language.service';
import { LinguaControlComponent } from './lingua.control.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-lingua-selector> rely on.
 * The control is a ControlValueAccessor exchanging a language code with the form. It shows the flag of the
 * current language and, on demand, the list of the languages known by the LanguageService.
 */

const flag = (name: string, altName: string, check = true): ILinguaFlag =>
  ({ name, altName, imageUrl: `assets/flags/Flag_${name}.svg`, label: altName, check });
const ALL = flag(ALLLIN, 'All languages', false);
const ENGLISH = flag('en', 'English');
const FRENCH = flag('fr', 'Français');
const GERMAN = flag('de', 'Deutsch');

@Component({
  template: `<ais-lingua-selector [formControl]="ctrl" [small]="small" [readonly]="readonly" [trim0]="trim0"
    [onlyValidLinguas]="only" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [LinguaControlComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<string>('fr', { nonNullable: true });
  small = false;
  readonly = false;
  trim0 = false;
  only: string[] = [];
}

describe('LinguaControlComponent', () => {
  const linguas = [ALL, ENGLISH, FRENCH, GERMAN];
  const languages = {
    linguas,
    get lintrim00() { return linguas.filter(f => f.name !== ALLLIN); },
    getFlag: (name: string) => linguas.find(f => f.name === name) ?? DEFAULT_FLAG,
  };
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const currentFlag = () => fixture.nativeElement.querySelector('.input-group img.flag') as HTMLImageElement;
  const leaf = () => fixture.nativeElement.querySelector('button.aisuite-leaf') as HTMLButtonElement;
  const popup = () => fixture.nativeElement.querySelector('.aisuite-control-list') as HTMLElement;
  const entries = () => Array.from(popup().querySelectorAll('button')) as HTMLButtonElement[];
  const entryNames = () => entries().map(entry => entry.textContent!.trim());

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: LanguageService, useValue: languages }],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is the standalone component <ais-lingua-selector> with its inputs', () => {
    const mirror = reflectComponentType(LinguaControlComponent)!;
    expect(mirror.selector).toBe('ais-lingua-selector');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(expect.arrayContaining(
      ['small', 'itemid', 'placeholder', 'disabled', 'readonly', 'trim0', 'onlyValidLinguas']));
  });

  it('shows the flag of the language written by the form', async () => {
    expect(currentFlag().getAttribute('src')).toBe('assets/flags/Flag_fr.svg');
    expect(currentFlag().alt).toBe('Français');

    host.ctrl.setValue('de');
    await settle();
    expect(currentFlag().getAttribute('src')).toBe('assets/flags/Flag_de.svg');
  });

  it('shows the default flag, greyed, for a language it does not know', async () => {
    host.ctrl.setValue('xx');
    await settle();
    expect(currentFlag().getAttribute('src')).toBe(DEFAULT_FLAG.imageUrl);
    expect(currentFlag().classList).toContain('disabled');
  });

  describe('list', () => {
    it('offers every language of the language service, named by its altName', () => {
      expect(entryNames()).toEqual(['All languages', 'English', 'Français', 'Deutsch']);
      expect(entries()[2].title).toBe('Français');
    });

    it('leaves out the "all languages" entry with trim0', async () => {
      host.trim0 = true;
      await settle();
      expect(entryNames()).toEqual(['English', 'Français', 'Deutsch']);
    });

    it('offers only the languages of onlyValidLinguas, which prevails over trim0', async () => {
      host.only = ['de', 'en'];
      host.trim0 = true;
      await settle();
      expect(entryNames()).toEqual(['English', 'Deutsch']);
    });

    it('is hidden until the leaf button is clicked', () => {
      expect(popup().style.display).toBe('none');
      leaf().click();
      fixture.detectChanges();
      expect(popup().style.display).toBe('block');
    });

    it('never shows in readonly mode, and hides the leaf button', async () => {
      host.readonly = true;
      await settle();
      expect(leaf().style.display).toBe('none');
      expect(popup().style.display).toBe('none');
    });

    it('disables the leaf button when there is nothing to choose from', async () => {
      expect(leaf().disabled).toBe(false);
      host.only = ['en'];
      await settle();
      expect(leaf().disabled).toBe(true);
    });
  });

  describe('choosing a language', () => {
    it('gives the form the language code, shows its flag and marks the control touched', async () => {
      entries()[3].click();
      await settle();
      expect(host.ctrl.value).toBe('de');
      expect(currentFlag().getAttribute('src')).toBe('assets/flags/Flag_de.svg');
      expect(host.ctrl.touched).toBe(true);
    });

    it('does nothing when the control is disabled', async () => {
      host.ctrl.disable();
      await settle();
      entries()[3].click();
      await settle();
      expect(host.ctrl.value).toBe('fr');
      expect(currentFlag().getAttribute('src')).toBe('assets/flags/Flag_fr.svg');
    });
  });

  describe('closing the list', () => {
    beforeEach(() => vi.useFakeTimers());

    it('closes once a language is chosen', () => {
      leaf().click();
      vi.advanceTimersByTime(800); // the list ignores hide requests for a moment after it opens
      fixture.detectChanges();
      expect(popup().style.display).toBe('block');

      entries()[1].click();
      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(popup().style.display).toBe('none');
    });

    it('closes on a click outside of the control', () => {
      leaf().click();
      vi.advanceTimersByTime(800);
      document.body.click();
      vi.advanceTimersByTime(800);
      fixture.detectChanges();
      expect(popup().style.display).toBe('none');
    });

    it('stays open on a click inside the control', () => {
      leaf().click();
      vi.advanceTimersByTime(800);
      popup().click();
      vi.advanceTimersByTime(800);
      fixture.detectChanges();
      expect(popup().style.display).toBe('block');
    });
  });

  it('follows the disabled state of the form control, dimming itself', async () => {
    const element: HTMLElement = fixture.nativeElement.querySelector('ais-lingua-selector');
    host.ctrl.disable();
    await settle();
    expect(leaf().disabled).toBe(true);
    expect(element.style.opacity).toBe('0.25');

    host.ctrl.enable();
    await settle();
    expect(leaf().disabled).toBe(false);
    expect(element.style.opacity).toBe('1');
  });

  it('shrinks the entries with the small input', async () => {
    expect(entries()[0].classList).toContain('py-1');
    host.small = true;
    await settle();
    expect(entries()[0].classList).toContain('py-0');
  });
});
