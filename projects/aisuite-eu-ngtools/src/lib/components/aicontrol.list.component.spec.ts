import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EMPTYGUID } from '../../public-api';
import { AISuiteCoreListItemModel } from '../models/aisuitecore.listitem.model';
import { AisuiteSelectModel } from '../models/aisuiteselect.model';
import { LivelyListDirective } from '../services/livelylist.directive';
import { AiControlListComponent } from './aicontrol.list.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-aicontrol-list> rely on.
 * The control edits a { unicId, name } form group (named by formGroupName, inside a parent formGroup) with a
 * text box, the user may type a name or pick it in the list. Its items come from the LivelyListDirective: the
 * control asks for the list `listname` (evPull, once the application has to fetch it), the application answers
 * with addcache (evRefresh).
 */

const item = (id: string, name: string, isPresel = false, cssClass = '') =>
  new AISuiteCoreListItemModel(id, name, '', cssClass, isPresel, `<b>${name}</b>`);

@Component({
  template: `<form [formGroup]="form">
    <ais-aicontrol-list formGroupName="item" listname="Cities" placeholder="city" [small]="small" [disabled]="disabled" />
  </form>`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AiControlListComponent, ReactiveFormsModule],
})
class HostComponent {
  form = new FormGroup({
    item: new FormGroup({ unicId: new FormControl(''), name: new FormControl('') }),
  });
  small = false;
  disabled = false;
}

describe('AiControlListComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let lists: LivelyListDirective;
  let pulls: AisuiteSelectModel[];

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const serve = async (items: AISuiteCoreListItemModel[], name = 'Cities') => {
    lists.addcache(new AisuiteSelectModel(name, '', new Date(), items));
    await settle();
  };
  const group = () => host.form.get('item') as FormGroup;
  const box = () => fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
  const leaf = () => fixture.nativeElement.querySelector('button.aisuite-leaf') as HTMLButtonElement;
  const popup = () => fixture.nativeElement.querySelector('.aisuite-control-list') as HTMLElement;
  const entries = () => Array.from(popup().querySelectorAll('button')) as HTMLButtonElement[];
  const entryNames = () => entries().map(entry => entry.textContent!.trim());
  const type = (value: string) => {
    box().value = value;
    box().dispatchEvent(new Event('input'));
  };
  const keyup = (key: string) => {
    const event = new KeyboardEvent('keyup', { key, cancelable: true });
    box().dispatchEvent(event);
    return event;
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [HostComponent] });
    lists = TestBed.inject(LivelyListDirective);
    pulls = [];
    lists.evPull.subscribe((request: AisuiteSelectModel) => pulls.push(request));
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is the standalone component <ais-aicontrol-list> with its inputs', () => {
    const mirror = reflectComponentType(AiControlListComponent)!;
    expect(mirror.selector).toBe('ais-aicontrol-list');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(expect.arrayContaining(
      ['listname', 'formGroupName', 'placeholder', 'small', 'disabled']));
  });

  it('asks once, after a short delay, for the list named listname', () => {
    expect(pulls).toEqual([]);
    vi.advanceTimersByTime(300);
    expect(pulls).toHaveLength(1);
    expect(pulls[0]).toMatchObject({ name: 'Cities' });
  });

  it('ignores the lists of other names', async () => {
    await serve([item('a', 'Lyon'), item('b', 'Paris')], 'Countries');
    expect(entries()).toHaveLength(0);
  });

  describe('form group', () => {
    it('shows the name of the group in the text box, with the placeholder, and edits it', async () => {
      expect(box().placeholder).toBe('city');
      group().patchValue({ name: 'Lyon' });
      await settle();
      expect(box().value).toBe('Lyon');

      type('Paris');
      expect(group().value.name).toBe('Paris');
    });

    it('keeps the unicId in a hidden input', () => {
      expect(fixture.nativeElement.querySelector('input[type=hidden]')).not.toBeNull();
    });
  });

  describe('items', () => {
    it('lists the items of the list, drawn from their html', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris', false, 'extra')]);
      expect(entryNames()).toEqual(['Lyon', 'Paris']);
      expect(entries()[0].innerHTML).toBe('<b>Lyon</b>');
      expect(Array.from(entries()[0].classList).sort()).toEqual(['list-group-item', 'py-1']);
      expect(Array.from(entries()[1].classList).sort()).toEqual(['extra', 'list-group-item', 'py-1']);
    });

    it('selects the only item of a list', async () => {
      await serve([item('a', 'Lyon')]);
      expect(group().value).toEqual({ unicId: 'a', name: 'Lyon' });
    });

    it('puts the preselected items first', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris', true), item('c', 'Nice')]);
      expect(entryNames()).toEqual(['Paris', 'Lyon', 'Paris', 'Nice']);
      expect(popup().querySelector('.dropdown-divider')).not.toBeNull();
    });

    it('narrows to the names containing what the user types (3 characters or more, any case)', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris'), item('c', 'Marseille')]);
      type('ARI');
      keyup('I');
      vi.advanceTimersByTime(300);
      fixture.detectChanges();
      expect(entryNames()).toEqual(['Paris']);
      expect(popup().style.display).toBe('block');
    });

    it('lists everything when what the user types is too short or matches nothing', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris'), item('c', 'Marseille')]);
      type('ar');
      keyup('r');
      vi.advanceTimersByTime(300);
      fixture.detectChanges();
      expect(entryNames()).toEqual(['Lyon', 'Paris', 'Marseille']);

      type('zzz');
      keyup('z');
      vi.advanceTimersByTime(300);
      fixture.detectChanges();
      expect(entryNames()).toEqual(['Lyon', 'Paris', 'Marseille']);
    });
  });

  describe('choosing an item', () => {
    beforeEach(() => serve([item('a', 'Lyon'), item('b', 'Paris')]));

    it('gives the group the id and the name of the item', () => {
      entries()[1].click();
      expect(group().value).toEqual({ unicId: 'b', name: 'Paris' });
    });

    it('does nothing when disabled', async () => {
      host.disabled = true;
      await settle();
      entries()[1].click();
      expect(group().value).toEqual({ unicId: '', name: '' });
    });
  });

  describe('typing a name', () => {
    beforeEach(() => serve([item('a', 'Lyon'), item('b', 'Paris')]));

    it('gives the group the id of the item of that name (any case) when leaving the text box', () => {
      type('pARIS');
      box().dispatchEvent(new Event('blur'));
      expect(group().value.unicId).toBe('b');
    });

    it('gives the group the id of the item of that name on Enter, without submitting the form', () => {
      type('lyon');
      expect(keyup('Enter').defaultPrevented).toBe(true);
      expect(group().value.unicId).toBe('a');
    });

    it('gives the group the empty guid when no item has that name', () => {
      group().patchValue({ unicId: 'a' });
      type('Berlin');
      box().dispatchEvent(new Event('blur'));
      expect(group().value.unicId).toBe(EMPTYGUID);
    });
  });

  describe('popup', () => {
    beforeEach(() => serve([item('a', 'Lyon'), item('b', 'Paris')]));

    it('is hidden until the leaf button is clicked', () => {
      expect(popup().style.display).toBe('none');
      leaf().click();
      fixture.detectChanges();
      expect(popup().style.display).toBe('block');
    });

    it('opens when the text box gets the focus', () => {
      box().dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      expect(popup().style.display).toBe('block');
    });

    it('closes after an item is chosen', () => {
      leaf().click();
      vi.advanceTimersByTime(800); // the popup ignores hide requests for a moment after it opens
      entries()[0].click();
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

    it('does not open when disabled', async () => {
      host.disabled = true;
      await settle();
      expect(leaf().disabled).toBe(true);
      box().dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      expect(popup().style.display).toBe('none');
    });
  });

  it('dims itself when disabled', async () => {
    const element: HTMLElement = fixture.nativeElement.querySelector('ais-aicontrol-list');
    host.disabled = true;
    await settle();
    expect(element.style.opacity).toBe('0.25');

    host.disabled = false;
    await settle();
    expect(element.style.opacity).toBe('1');
  });

  it('shrinks the text box and the entries with the small input', async () => {
    await serve([item('a', 'Lyon'), item('b', 'Paris')]);
    host.small = true;
    await settle();
    expect(box().classList).toContain('form-control-sm');
    expect(entries()[0].classList).toContain('py-0');
  });
});
