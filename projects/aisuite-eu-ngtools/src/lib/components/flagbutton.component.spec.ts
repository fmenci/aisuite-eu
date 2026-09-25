import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ILinguaFlag } from '../models/ilingua.flag';
import { ALLLIN, DEFAULT_FLAG, LanguageService } from '../services/language.service';
import { FlagButtonComponent } from './flagbutton.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-flag-button> rely on.
 * The button shows the flag of the language `mylin` and tells which language was clicked through `linguaEvent`.
 */

const FRENCH: ILinguaFlag = {
  name: 'fr', altName: 'Français', imageUrl: 'assets/flags/Flag_fr.svg', label: 'French', check: true,
};

@Component({
  template: `<ais-flag-button [mylin]="lin" [isActive]="active" (linguaEvent)="events.push($event)" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FlagButtonComponent],
})
class HostComponent {
  lin = 'fr';
  active = false;
  events: string[] = [];
}

describe('FlagButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let languages: { getFlag: ReturnType<typeof vi.fn> };

  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;

  const create = (flag: ILinguaFlag) => {
    languages.getFlag.mockReturnValue(flag);
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    languages = { getFlag: vi.fn() };
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: LanguageService, useValue: languages }],
    });
  });

  it('is the standalone component <ais-flag-button> with inputs mylin and isActive and output linguaEvent', () => {
    const mirror = reflectComponentType(FlagButtonComponent)!;
    expect(mirror.selector).toBe('ais-flag-button');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(expect.arrayContaining(['mylin', 'isActive']));
    expect(mirror.outputs.map(o => o.templateName)).toEqual(expect.arrayContaining(['linguaEvent']));
  });

  it('shows all languages ("00") when no language is given', () => {
    const flagButton = TestBed.createComponent(FlagButtonComponent).componentInstance;
    expect(flagButton.mylin).toBe(ALLLIN);
    expect(flagButton.isActive).toBe(false);
  });

  it('asks the language service for the flag of mylin', () => {
    create(FRENCH);
    expect(languages.getFlag).toHaveBeenCalledWith('fr');
  });

  it('draws the flag image and names the language in the button title', () => {
    create(FRENCH);
    const image = button()!.querySelector('img')!;
    expect(image.getAttribute('src')).toBe('assets/flags/Flag_fr.svg');
    expect(image.alt).toBe('Français');
    expect(button()!.title).toBe('French');
  });

  it('draws nothing for a language which is not checked, such as the default flag', () => {
    create(DEFAULT_FLAG);
    expect(button()).toBeNull();
  });

  it('is light when inactive and primary when active', async () => {
    create(FRENCH);
    expect(button()!.classList).toContain('btn-light');
    expect(button()!.classList).not.toContain('btn-primary');
    expect(button()!.classList).not.toContain('btn-active');

    host.active = true;
    fixture.detectChanges();
    expect(button()!.classList).toContain('btn-primary');
    expect(button()!.classList).toContain('btn-active');
    expect(button()!.classList).not.toContain('btn-light');
  });

  it('tells which language was clicked through linguaEvent', () => {
    create(FRENCH);
    button()!.click();
    button()!.click();
    expect(host.events).toEqual(['fr', 'fr']);
  });
});
