import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { LanguageService } from './language.service';
import { LinScePipe } from './linsce.pipe';

@Component({
  template: `<span>{{ 'Hello' | linsceLocalisation : 'WDR' }}</span>`,
  imports: [LinScePipe],
})
class HostComponent { }

@Component({
  template: `<span>{{ 'Hello' | linsceLocalisation : 'WDR' : lingua() }}</span>`,
  imports: [LinScePipe],
})
class SwitchHostComponent { lingua = signal('en'); }

describe('LinScePipe', () => {
  it('is used as linsceLocalisation and asks the LanguageService for the label of tag and formula', () => {
    const label = vi.fn((formula: string, tag: string) => `${formula}/${tag}`);
    TestBed.configureTestingModule({ providers: [{ provide: LanguageService, useValue: { label } }] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('WDR/Hello');
    expect(label).toHaveBeenCalledWith('WDR', 'Hello');
  });

  it('asks again for the label when the language given as 3rd argument changes', () => {
    const label = vi.fn(() => 'x');
    TestBed.configureTestingModule({ providers: [{ provide: LanguageService, useValue: { label } }] });
    const fixture = TestBed.createComponent(SwitchHostComponent);
    fixture.detectChanges();
    fixture.componentInstance.lingua.set('fr');
    fixture.detectChanges();
    expect(label).toHaveBeenCalledTimes(2);
  });
});
