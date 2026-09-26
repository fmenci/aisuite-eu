import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AISuiteCoreListItemModel } from '../models/aisuitecore.listitem.model';
import { AisuiteSelectModel } from '../models/aisuiteselect.model';
import { LivelyListDirective } from '../services/livelylist.directive';
import { SelectorControlComponent } from './selector.control.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-control-selector> rely on.
 * The control is a ControlValueAccessor exchanging the id of an item with the form. Its items come from the
 * LivelyListDirective: the control asks for the list `listname` of `parentid` (evPull, once the application has to
 * fetch it), the application answers with addcache (evRefresh).
 */

const item = (id: string, name: string, isPresel = false, cssClass = '') =>
  new AISuiteCoreListItemModel(id, name, '', cssClass, isPresel, `<b>${name}</b>`);

@Component({
  template: `<ais-control-selector [formControl]="ctrl" listname="Cities" [parentid]="parent" placeholder="city" [small]="small" />`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SelectorControlComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<string>('', { nonNullable: true });
  parent = 'p1';
  small = false;
}

describe('SelectorControlComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let lists: LivelyListDirective;
  let pulls: AisuiteSelectModel[];

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  /** the application answers a request for the list of `parent` */
  const serve = async (items: AISuiteCoreListItemModel[], parent = 'p1', name = 'Cities') => {
    lists.addcache(new AisuiteSelectModel(name, parent, new Date(), items));
    await settle();
  };
  const display = () => (fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement).value;
  const leaf = () => fixture.nativeElement.querySelector('button.aisuite-leaf') as HTMLButtonElement;
  const popup = () => fixture.nativeElement.querySelector('.aisuite-control-list') as HTMLElement;
  const entries = () => Array.from(popup().querySelectorAll('button')) as HTMLButtonElement[];
  const entryNames = () => entries().map(entry => entry.textContent!.trim());

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

  it('is the standalone component <ais-control-selector> with its inputs', () => {
    const mirror = reflectComponentType(SelectorControlComponent)!;
    expect(mirror.selector).toBe('ais-control-selector');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(expect.arrayContaining(
      ['listname', 'small', 'itemid', 'placeholder', 'disabled', 'parentid']));
  });

  it('defaults to the list "ListEntities"', () => {
    expect(TestBed.createComponent(SelectorControlComponent).componentInstance.listname).toBe('ListEntities');
  });

  describe('list request', () => {
    it('asks once, after a short delay, for the list named listname of parentid', () => {
      expect(pulls).toEqual([]);
      vi.advanceTimersByTime(300);
      expect(pulls).toHaveLength(1);
      expect(pulls[0]).toMatchObject({ name: 'Cities', unicId: 'p1' });
    });

    it('asks again when parentid changes', async () => {
      vi.advanceTimersByTime(300);
      host.parent = 'p2';
      await settle();
      vi.advanceTimersByTime(300);
      expect(pulls.map(request => request.unicId)).toEqual(['p1', 'p2']);
    });

    it('does not ask when the application already answered for that list', async () => {
      pulls.length = 0;
      await serve([item('a', 'Lyon'), item('b', 'Paris')]);
      host.parent = 'p1';
      vi.advanceTimersByTime(300);
      expect(pulls).toEqual([]);
    });

    it('ignores the lists of other names and other parents', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris')], 'p1', 'Countries');
      await serve([item('a', 'Lyon'), item('b', 'Paris')], 'other');
      expect(entries()).toHaveLength(0);
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

    it('shows the name of the item the form holds', async () => {
      host.ctrl.setValue('b');
      await serve([item('a', 'Lyon'), item('b', 'Paris')]);
      expect(display()).toBe('Paris');
    });

    it('shows "-" when the form holds no item of the list', async () => {
      host.ctrl.setValue('unknown');
      await serve([item('a', 'Lyon'), item('b', 'Paris')]);
      expect(display()).toBe('-');
    });

    it('selects the only item of a list', async () => {
      await serve([item('a', 'Lyon')]);
      expect(host.ctrl.value).toBe('a');
      expect(display()).toBe('Lyon');
    });

    it('puts the preselected items first, when there are some but not all', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris', true), item('c', 'Nice')]);
      expect(entryNames()).toEqual(['Paris', 'Lyon', 'Paris', 'Nice']);
      expect(popup().querySelectorAll('.list-group')).toHaveLength(2);
      expect(popup().querySelector('.dropdown-divider')).not.toBeNull();
    });

    it('lists the items once when all or none is preselected', async () => {
      await serve([item('a', 'Lyon', true), item('b', 'Paris', true)]);
      expect(entryNames()).toEqual(['Lyon', 'Paris']);
      expect(popup().querySelector('.dropdown-divider')).toBeNull();
    });
  });

  describe('choosing an item', () => {
    beforeEach(() => serve([item('a', 'Lyon'), item('b', 'Paris')]));

    it('gives the form the id of the item, shows its name and marks the control touched', async () => {
      entries()[1].click();
      await settle();
      expect(host.ctrl.value).toBe('b');
      expect(display()).toBe('Paris');
      expect(host.ctrl.touched).toBe(true);
    });

    it('does nothing when the control is disabled', async () => {
      host.ctrl.disable();
      await settle();
      entries()[1].click();
      await settle();
      expect(host.ctrl.value).toBe('');
    });
  });

  describe('popup', () => {
    it('is hidden until the leaf button is clicked, and closes after the item is chosen', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris')]);
      expect(popup().style.display).toBe('none');

      leaf().click();
      fixture.detectChanges();
      expect(popup().style.display).toBe('block');

      vi.advanceTimersByTime(800); // the popup ignores hide requests for a moment after it opens
      entries()[0].click();
      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(popup().style.display).toBe('none');
    });

    it('closes on a click outside of the control', async () => {
      await serve([item('a', 'Lyon'), item('b', 'Paris')]);
      leaf().click();
      vi.advanceTimersByTime(800);
      document.body.click();
      vi.advanceTimersByTime(800);
      fixture.detectChanges();
      expect(popup().style.display).toBe('none');
    });

    it('cannot be opened when there is nothing to choose from', async () => {
      expect(leaf().disabled).toBe(true);
      await serve([item('a', 'Lyon')]);
      expect(leaf().disabled).toBe(true);
      lists.clear(); // the first answer for a list is kept until the cache is cleared
      await serve([item('a', 'Lyon'), item('b', 'Paris')]);
      expect(leaf().disabled).toBe(false);
    });
  });

  it('displays the chosen item in a read only text box, with the placeholder', () => {
    const box = fixture.nativeElement.querySelector('input[type=text]') as HTMLInputElement;
    expect(box.readOnly).toBe(true);
    expect(box.placeholder).toBe('city');
  });

  it('follows the disabled state of the form control, dimming itself', async () => {
    await serve([item('a', 'Lyon'), item('b', 'Paris')]);
    const element: HTMLElement = fixture.nativeElement.querySelector('ais-control-selector');
    host.ctrl.disable();
    await settle();
    expect(leaf().disabled).toBe(true);
    expect(element.style.opacity).toBe('0.25');

    host.ctrl.enable();
    await settle();
    expect(leaf().disabled).toBe(false);
    expect(element.style.opacity).toBe('1');
  });

  it('shrinks the text box and the entries with the small input', async () => {
    await serve([item('a', 'Lyon'), item('b', 'Paris')]);
    host.small = true;
    await settle();
    expect(fixture.nativeElement.querySelector('input[type=text]').classList).toContain('form-control-sm');
    expect(entries()[0].classList).toContain('py-0');
  });
});
