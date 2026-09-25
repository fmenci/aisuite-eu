import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { LanguageService } from './language.service';
import { LinScePipe } from './linsce.pipe';

@Component({
  template: `<span>{{ 'Hello' | linsceLocalisation : 'WDR' }}</span>`,
  imports: [LinScePipe],
})
class HostComponent { }

describe('LinScePipe', () => {
  it('is used as linsceLocalisation and asks the LanguageService for the label of tag and formula', () => {
    const label = vi.fn((formula: string, tag: string) => `${formula}/${tag}`);
    TestBed.configureTestingModule({ providers: [{ provide: LanguageService, useValue: { label } }] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('WDR/Hello');
    expect(label).toHaveBeenCalledWith('WDR', 'Hello');
  });
});
