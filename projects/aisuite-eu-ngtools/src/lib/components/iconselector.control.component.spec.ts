import { ChangeDetectionStrategy, Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IconDtoModel } from '../models/icondto.model';
import { IconTypeEnum } from '../models/icontype.enum';
import { IconSelectorControlComponent } from './iconselector.control.component';

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-icon-selector> rely on.
 * The control edits an { iconType, iconValue, iconTitle } form group (named by formGroupName, inside a parent
 * formGroup), initialised from the IconDtoModel `metamodel`, and previews the icon it describes.
 */

@Component({
  template: `<form [formGroup]="form">
    <ais-icon-selector formGroupName="icon" [metamodel]="meta" [small]="small" (formReady)="ready.push($event)" />
  </form>`,
   
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IconSelectorControlComponent, ReactiveFormsModule],
})
class HostComponent {
  form = new FormGroup({
    icon: new FormGroup({ iconType: new FormControl(0), iconValue: new FormControl(''), iconTitle: new FormControl('') }),
  });
  meta: IconDtoModel | undefined = new IconDtoModel(IconTypeEnum.imageTag, '/img/logo.png', 'Logo');
  small = false;
  ready: FormGroup[] = [];
}

describe('IconSelectorControlComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const group = () => host.form.get('icon') as FormGroup;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const preview = () => fixture.nativeElement.querySelector('.icon-selector-display') as HTMLElement;
  /** what the preview draws for an icon, the way the user sees it */
  const show = async (iconType: IconTypeEnum, iconValue = 'v', iconTitle = 't') => {
    group().patchValue({ iconType, iconValue, iconTitle });
    await settle();
  };
  const titleBox = () => fixture.nativeElement.querySelector('input.icon-title') as HTMLInputElement | null;
  const valueBox = () => fixture.nativeElement.querySelector('input.icon-value') as HTMLInputElement;

  const create = async (meta: IconDtoModel | undefined) => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.meta = meta;
    await settle();
  };

  beforeEach(() => create(new IconDtoModel(IconTypeEnum.imageTag, '/img/logo.png', 'Logo')));

  it('is the standalone component <ais-icon-selector> with inputs metamodel, formGroupName and small and output formReady', () => {
    const mirror = reflectComponentType(IconSelectorControlComponent)!;
    expect(mirror.selector).toBe('ais-icon-selector');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs.map(i => i.templateName)).toEqual(expect.arrayContaining(['metamodel', 'formGroupName', 'small']));
    expect(mirror.outputs.map(o => o.templateName)).toEqual(expect.arrayContaining(['formReady']));
  });

  describe('form group', () => {
    it('emits formReady with the group it edits', () => {
      expect(host.ready).toEqual([group()]);
    });

    it('is initialised from the metamodel', () => {
      expect(group().value).toEqual({ iconType: IconTypeEnum.imageTag, iconValue: '/img/logo.png', iconTitle: 'Logo' });
    });

    it('follows the metamodel when the application replaces it', async () => {
      host.meta = new IconDtoModel(IconTypeEnum.svg, '/img/new.svg', 'New');
      await settle();
      expect(group().value).toEqual({ iconType: IconTypeEnum.svg, iconValue: '/img/new.svg', iconTitle: 'New' });
    });

    it('is left as it is when the application withdraws the metamodel', async () => {
      host.meta = undefined;
      await settle();
      expect(group().value).toEqual({ iconType: IconTypeEnum.imageTag, iconValue: '/img/logo.png', iconTitle: 'Logo' });
    });

    it('does not make Angular warn about a control which cannot register with the parent form (NG01354)', async () => {
      TestBed.resetTestingModule();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        await create(new IconDtoModel(IconTypeEnum.imageTag, '/img/logo.png', 'Logo'));
        expect(warn.mock.calls.filter(call => String(call[0]).includes('NG01354'))).toEqual([]);
      } finally {
        warn.mockRestore();
      }
    });

    it('is left as it is without metamodel', async () => {
      TestBed.resetTestingModule();
      await create(undefined);
      expect(group().value).toEqual({ iconType: 0, iconValue: '', iconTitle: '' });
    });

    it('is edited by the icon type selector, the value box and the title box', async () => {
      const select = fixture.nativeElement.querySelector('ais-icontype-input select') as HTMLSelectElement;
      expect(select.value).toBe(String(IconTypeEnum.imageTag));

      select.value = String(IconTypeEnum.svg);
      select.dispatchEvent(new Event('change'));
      await settle();
      expect(group().value.iconType).toBe(IconTypeEnum.svg);

      valueBox().value = '<svg/>';
      valueBox().dispatchEvent(new Event('input'));
      titleBox()!.value = 'Vector';
      titleBox()!.dispatchEvent(new Event('input'));
      expect(group().value).toEqual({ iconType: IconTypeEnum.svg, iconValue: '<svg/>', iconTitle: 'Vector' });
    });
  });

  describe('preview', () => {
    it('is a dash when there is no icon', async () => {
      await show(IconTypeEnum.none);
      expect(preview().textContent!.trim()).toBe('-');
      expect(preview().querySelector('img, i')).toBeNull();
    });

    it('draws an image tag from its url, titled', async () => {
      await show(IconTypeEnum.imageTag, '/img/a.png', 'A');
      const image = preview().querySelector('img')!;
      expect(image.getAttribute('src')).toBe('/img/a.png');
      expect(image.alt).toBe('A');
    });

    it('draws a font awesome icon from its name', async () => {
      await show(IconTypeEnum.fontawesome, 'leaf');
      const icon = preview().querySelector('.icon-selector-fontawesome i')!;
      expect(Array.from(icon.classList).sort()).toEqual(['fa-leaf', 'fas']);
    });

    it('draws an iconografia icon from the images/iconography folder', async () => {
      await show(IconTypeEnum.iconografia, 'star');
      const image = preview().querySelector<HTMLImageElement>('.iconografia img')!;
      expect(image.getAttribute('src')).toBe('/images/iconography/star.svg');
      expect(image.alt).toBe('star');
    });

    it('draws an svg from its url, titled', async () => {
      await show(IconTypeEnum.svg, '/img/a.svg', 'A');
      const image = preview().querySelector('img')!;
      expect(image.getAttribute('src')).toBe('/img/a.svg');
      expect(image.alt).toBe('A');
    });

    it('draws a doko picture from the FOTO folder as a jpg, titled', async () => {
      await show(IconTypeEnum.doko, 'guid', 'Photo');
      const image = preview().querySelector('img')!;
      expect(image.getAttribute('src')).toBe('/FOTO/guid.jpg');
      expect(image.alt).toBe('Photo');
    });

    it('draws a doko svg from the FOTO folder as an svg, titled', async () => {
      await show(IconTypeEnum.dokoSvg, 'guid', 'Drawing');
      const image = preview().querySelector('img')!;
      expect(image.getAttribute('src')).toBe('/FOTO/guid.svg');
      expect(image.alt).toBe('Drawing');
    });
  });

  describe('title box', () => {
    it.each([IconTypeEnum.imageTag, IconTypeEnum.svg, IconTypeEnum.doko, IconTypeEnum.dokoSvg])(
      'is offered for icon type %i', async (iconType: IconTypeEnum) => {
        await show(iconType);
        expect(titleBox()).not.toBeNull();
      });

    it.each([IconTypeEnum.none, IconTypeEnum.fontawesome, IconTypeEnum.iconografia])(
      'is not offered for icon type %i', async (iconType: IconTypeEnum) => {
        await show(iconType);
        expect(titleBox()).toBeNull();
      });
  });

  it('shrinks the value and title boxes with the small input', async () => {
    expect(valueBox().classList).not.toContain('form-control-sm');
    host.small = true;
    await settle();
    expect(valueBox().classList).toContain('form-control-sm');
    expect(titleBox()!.classList).toContain('form-control-sm');
  });
});
