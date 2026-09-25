import { describe, expect, expectTypeOf, it } from 'vitest';

import * as publicApi from '../../public-api';
import { AISuiteMetaModel } from './aisuite.meta.model';
import { AISuiteCoreListItemModel } from './aisuitecore.listitem.model';
import { AisuiteSelectModel } from './aisuiteselect.model';
import { Currency } from './currency.enum';
import { CurrencyConversionModel } from './currencyconversion.model';
import { DateRangeModel } from './daterange.model';
import { DownloadFileModel } from './downloadfile.model';
import { FileLoaderModel } from './fileloader.model';
import { IAjaxResponse } from './iajax.response';
import { IAjaxSingleResponse } from './iajaxsingle.response';
import { IconDtoModel } from './icondto.model';
import { IconTypeEnum } from './icontype.enum';
import { ILinguaFlag } from './ilingua.flag';
import { LanguageFormula } from './languageformula.model';
import { LanguageTag } from './languagetag.model';
import { LimitsModel } from './limits.model';
import { LinguaQueryModel } from './linguaquery.model';

/*
 * Contract tests for the models exposed by the library (see public-api.ts).
 *
 * The models are consumed by other AI Suite applications, so what is pinned here is what they can rely on:
 *  - members are never removed, renamed, retyped or re-ordered (constructors are called positionally),
 *  - enum members keep their numeric value (values travel to and from the server),
 *  - constructors never gain a required parameter.
 * Adding an optional member, a trailing optional parameter or a new enum member is NOT a breaking change and
 * does not fail these tests. When a test fails, the change is a breaking one: bump the library major version
 * and update the test on purpose.
 *
 * Type contracts use expectTypeOf, which is checked by the compiler (ng test), not at runtime: each shape is
 * asserted both ways (`Contract` extends `Model` and `Model` extends `Contract`) so a member cannot be removed,
 * retyped, nor turned into a required one without an error.
 */

/** own enumerable members of a numeric enum, without the reverse (value -> name) mapping */
const enumMembers = (e: object) => Object.fromEntries(Object.entries(e).filter(([key]) => Number.isNaN(Number(key))));

describe('models public API', () => {
  it('exposes every model class and enum from public-api', () => {
    expect(publicApi.AISuiteMetaModel).toBe(AISuiteMetaModel);
    expect(publicApi.AISuiteCoreListItemModel).toBe(AISuiteCoreListItemModel);
    expect(publicApi.AisuiteSelectModel).toBe(AisuiteSelectModel);
    expect(publicApi.Currency).toBe(Currency);
    expect(publicApi.CurrencyConversionModel).toBe(CurrencyConversionModel);
    expect(publicApi.DateRangeModel).toBe(DateRangeModel);
    expect(publicApi.DownloadFileModel).toBe(DownloadFileModel);
    expect(publicApi.FileLoaderModel).toBe(FileLoaderModel);
    expect(publicApi.IconDtoModel).toBe(IconDtoModel);
    expect(publicApi.IconTypeEnum).toBe(IconTypeEnum);
    expect(publicApi.LanguageFormula).toBe(LanguageFormula);
    expect(publicApi.LanguageTag).toBe(LanguageTag);
    expect(publicApi.LimitsModel).toBe(LimitsModel);
    expect(publicApi.LinguaQueryModel).toBe(LinguaQueryModel);
  });

  it('exposes every model interface from public-api', () => {
    // interfaces have no runtime existence: this fails to compile when one stops being exported
    expectTypeOf<publicApi.IAjaxResponse<string>>().toEqualTypeOf<IAjaxResponse<string>>();
    expectTypeOf<publicApi.IAjaxSingleResponse<string>>().toEqualTypeOf<IAjaxSingleResponse<string>>();
    expectTypeOf<publicApi.ILinguaFlag>().toEqualTypeOf<ILinguaFlag>();
  });
});

describe('enums', () => {
  it('Currency keeps its members and numeric values', () => {
    expect(enumMembers(Currency)).toMatchObject({ EUR: 0, CHF: 1, GBP: 2, JPY: 3, USD: 4 });
  });

  it('Currency is a runtime numeric enum with reverse mapping', () => {
    expect(Currency[Currency.EUR]).toBe('EUR');
    expect(Currency[4]).toBe('USD');
  });

  it('IconTypeEnum keeps its members and numeric values', () => {
    expect(enumMembers(IconTypeEnum)).toMatchObject({
      none: 0, imageTag: 1, fontawesome: 2, iconografia: 3, svg: 4, doko: 5, dokoSvg: 6,
    });
  });

  it('IconTypeEnum is a runtime numeric enum with reverse mapping', () => {
    expect(IconTypeEnum[IconTypeEnum.none]).toBe('none');
    expect(IconTypeEnum[6]).toBe('dokoSvg');
  });
});

describe('interfaces', () => {
  it('IAjaxResponse<T> is { success, valid, message, count, data: T[] }', () => {
    interface Contract<T> { success: boolean; valid: boolean; message: string; count: number; data: T[] }
    expectTypeOf<Contract<string>>().toExtend<IAjaxResponse<string>>();
    expectTypeOf<IAjaxResponse<string>>().toExtend<Contract<string>>();

    // a server payload can be read through it
    const response: IAjaxResponse<{ id: number }> = JSON.parse(
      '{"success":true,"valid":true,"message":"ok","count":1,"data":[{"id":7}]}');
    expect(response.count).toBe(1);
    expect(response.data[0].id).toBe(7);
  });

  it('IAjaxSingleResponse<T> is { success, valid, message, data: T }', () => {
    interface Contract<T> { success: boolean; valid: boolean; message: string; data: T }
    expectTypeOf<Contract<string>>().toExtend<IAjaxSingleResponse<string>>();
    expectTypeOf<IAjaxSingleResponse<string>>().toExtend<Contract<string>>();

    const response: IAjaxSingleResponse<{ id: number }> = JSON.parse(
      '{"success":true,"valid":false,"message":"ko","data":{"id":7}}');
    expect(response.valid).toBe(false);
    expect(response.data.id).toBe(7);
  });

  it('ILinguaFlag is { check, name, label, altName, imageUrl }', () => {
    interface Contract { check: boolean; name: string; label: string; altName: string; imageUrl: string }
    expectTypeOf<Contract>().toExtend<ILinguaFlag>();
    expectTypeOf<ILinguaFlag>().toExtend<Contract>();
  });
});

describe('classes', () => {
  describe('AISuiteMetaModel', () => {
    it('maps constructor arguments in order', () => {
      expect(new AISuiteMetaModel('id', 'name')).toMatchObject({ unicId: 'id', name: 'name' });
    });

    it('needs no argument', () => {
      expect(new AISuiteMetaModel()).toBeInstanceOf(AISuiteMetaModel);
    });

    it('keeps its member types', () => {
      interface Contract { unicId?: string; name?: string }
      expectTypeOf<Contract>().toExtend<AISuiteMetaModel>();
      expectTypeOf<AISuiteMetaModel>().toExtend<Contract>();
    });
  });

  describe('BusinessCoreListItemModel', () => {
    it('maps constructor arguments in order', () => {
      expect(new AISuiteCoreListItemModel('id', 'name', 'desc', 'css', true, '<b/>')).toMatchObject({
        id: 'id', name: 'name', description: 'desc', cssClass: 'css', isPresel: true, html: '<b/>',
      });
    });

    it('needs no argument', () => {
      expect(new AISuiteCoreListItemModel()).toBeInstanceOf(AISuiteCoreListItemModel);
    });

    it('keeps its member types', () => {
      interface Contract {
        id?: string; name?: string; description?: string; cssClass?: string; isPresel?: boolean; html?: string;
      }
      expectTypeOf<Contract>().toExtend<AISuiteCoreListItemModel>();
      expectTypeOf<AISuiteCoreListItemModel>().toExtend<Contract>();
    });
  });

  // the class name misses a "s" (BusinesCore): it is part of the public API, do not "fix" it without a major version
  describe('BusinesCoreModel', () => {
    const ondate = new Date(2026, 0, 31);

    it('maps constructor arguments in order', () => {
      const items = [new AISuiteCoreListItemModel('i1')];
      expect(new AisuiteSelectModel('name', 'id', ondate, items)).toMatchObject({
        name: 'name', unicId: 'id', ondate, listdata: items,
      });
    });

    it('needs name, unicId and ondate only', () => {
      expect(new AisuiteSelectModel('name', 'id', ondate).listdata).toBeUndefined();
    });

    it('keeps its member types', () => {
      interface Contract { name: string; unicId: string; ondate: Date; listdata?: AISuiteCoreListItemModel[] }
      expectTypeOf<Contract>().toExtend<AisuiteSelectModel>();
      expectTypeOf<AisuiteSelectModel>().toExtend<Contract>();
    });
  });

  describe('CurrencyConversionModel', () => {
    it('maps constructor arguments in order', () => {
      const ondate = new Date(2026, 0, 31);
      expect(new CurrencyConversionModel(Currency.EUR, Currency.USD, ondate, 12.5, true)).toMatchObject({
        curfrom: Currency.EUR, curto: Currency.USD, ondate, amount: 12.5, verified: true,
      });
    });

    it('needs no argument and is not verified by default', () => {
      const model = new CurrencyConversionModel();
      expect(model.verified).toBe(false);
      expect(model.amount).toBeUndefined();
    });

    it('keeps its member types', () => {
      interface Contract { curfrom?: Currency; curto?: Currency; ondate?: Date; amount?: number; verified: boolean }
      expectTypeOf<Contract>().toExtend<CurrencyConversionModel>();
      expectTypeOf<CurrencyConversionModel>().toExtend<Contract>();
    });
  });

  describe('DateRangeModel', () => {
    it('maps constructor arguments in order', () => {
      const from = new Date(2026, 0, 1);
      const to = new Date(2026, 0, 31);
      expect(new DateRangeModel('id', from, to, 3)).toMatchObject({ unicId: 'id', fromDate: from, toDate: to, tipo: 3 });
    });

    it('accepts open ended ranges', () => {
      expect(new DateRangeModel('id', null, null, 0)).toMatchObject({ fromDate: null, toDate: null });
    });

    it('keeps its member types', () => {
      interface Contract { unicId: string; fromDate: Date | null; toDate: Date | null; tipo: number }
      expectTypeOf<Contract>().toExtend<DateRangeModel>();
      expectTypeOf<DateRangeModel>().toExtend<Contract>();
    });
  });

  describe('DownloadFileModel', () => {
    it('maps constructor arguments in order', () => {
      const data = new Blob(['content']);
      expect(new DownloadFileModel('file.txt', data)).toMatchObject({ filename: 'file.txt', data });
    });

    it('accepts a missing blob', () => {
      expect(new DownloadFileModel('file.txt', null).data).toBeNull();
    });

    it('keeps its member types', () => {
      interface Contract { filename: string; data: Blob | null }
      expectTypeOf<Contract>().toExtend<DownloadFileModel>();
      expectTypeOf<DownloadFileModel>().toExtend<Contract>();
    });
  });

  describe('FileLoaderModel', () => {
    it('maps constructor arguments in order', () => {
      expect(new FileLoaderModel('id', 2, 'base64', 'file.txt', 'text/plain')).toMatchObject({
        unicId: 'id', tranche: 2, data: 'base64', fileName: 'file.txt', mimeType: 'text/plain',
      });
    });

    it('needs no argument', () => {
      expect(new FileLoaderModel()).toBeInstanceOf(FileLoaderModel);
    });

    it('keeps its member types', () => {
      interface Contract { unicId?: string; tranche?: number; data?: string; fileName?: string; mimeType?: string }
      expectTypeOf<Contract>().toExtend<FileLoaderModel>();
      expectTypeOf<FileLoaderModel>().toExtend<Contract>();
    });
  });

  describe('IconDtoModel', () => {
    it('maps constructor arguments in order', () => {
      expect(new IconDtoModel(IconTypeEnum.svg, 'value', 'title')).toMatchObject({
        iconType: IconTypeEnum.svg, iconValue: 'value', iconTitle: 'title',
      });
    });

    it('needs no argument', () => {
      expect(new IconDtoModel()).toBeInstanceOf(IconDtoModel);
    });

    it('keeps its member types', () => {
      interface Contract { iconType?: IconTypeEnum; iconValue?: string; iconTitle?: string }
      expectTypeOf<Contract>().toExtend<IconDtoModel>();
      expectTypeOf<IconDtoModel>().toExtend<Contract>();
    });
  });

  describe('LanguageTag', () => {
    it('maps constructor arguments in order', () => {
      expect(new LanguageTag('tag', 'comment', 4)).toMatchObject({ tag: 'tag', pcmt: 'comment', use: 4 });
    });

    it('defaults use to 0', () => {
      expect(new LanguageTag('tag', 'comment').use).toBe(0);
    });

    it('keeps its member types', () => {
      interface Contract { tag: string; pcmt: string; use: number }
      expectTypeOf<Contract>().toExtend<LanguageTag>();
      expectTypeOf<LanguageTag>().toExtend<Contract>();
    });
  });

  describe('LanguageFormula', () => {
    it('maps constructor arguments in order', () => {
      const tags = [new LanguageTag('tag', 'comment')];
      expect(new LanguageFormula('formula', 'en', tags)).toMatchObject({ formula: 'formula', lingua: 'en', tags });
    });

    it('keeps its member types', () => {
      interface Contract { formula: string; lingua: string; tags: LanguageTag[] }
      expectTypeOf<Contract>().toExtend<LanguageFormula>();
      expectTypeOf<LanguageFormula>().toExtend<Contract>();
    });
  });

  describe('LimitsModel', () => {
    it('maps constructor arguments in order', () => {
      expect(new LimitsModel('name', 1, 2, 3, 4, 5, 6, 7, 'physic', 'low', 'high', 8)).toMatchObject({
        name: 'name', lowno: 1, lowband: 2, nominal: 3, highband: 4, highno: 5,
        decimalaccuracy: 6, storeprecision: 7, limitPhysicMessage: 'physic',
        alertlow: 'low', alerthigh: 'high', step: 8,
      });
    });

    it('needs the nine leading arguments only', () => {
      const model = new LimitsModel('name', 1, 2, 3, 4, 5, 6, 7, 'physic');
      expect(model.alertlow).toBeUndefined();
      expect(model.alerthigh).toBeUndefined();
      expect(model.step).toBeUndefined();
    });

    it('keeps its member types', () => {
      interface Contract {
        name: string; lowno: number; lowband: number; nominal: number; highband: number; highno: number;
        decimalaccuracy: number; storeprecision: number; limitPhysicMessage: string;
        alertlow?: string; alerthigh?: string; step?: number;
      }
      expectTypeOf<Contract>().toExtend<LimitsModel>();
      expectTypeOf<LimitsModel>().toExtend<Contract>();
    });
  });

  describe('LinguaQueryModel', () => {
    it('maps constructor arguments in order', () => {
      expect(new LinguaQueryModel('formula', 'tag', 'en', true)).toMatchObject({
        formula: 'formula', tag: 'tag', lingua: 'en', search: true,
      });
    });

    it('defaults search to false', () => {
      expect(new LinguaQueryModel('formula', 'tag', 'en').search).toBe(false);
    });

    it('keeps its member types', () => {
      interface Contract { formula: string; tag: string; lingua: string; search: boolean }
      expectTypeOf<Contract>().toExtend<LinguaQueryModel>();
      expectTypeOf<LinguaQueryModel>().toExtend<Contract>();
    });
  });
});
