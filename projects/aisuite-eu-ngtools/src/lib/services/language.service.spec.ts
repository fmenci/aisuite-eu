import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DEFAULT_LINSCE_ROUTES, LinSceConfigService } from '../api-config';
import { DEFAULT_DOC_HEADER } from './default-doc-header';
import { DEFLIN, LanguageService } from './language.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LinSceConfigService, useValue: { opLingua: 'en', linsceApiUrl: '', uiLanguageJS: undefined } },
      ],
    });
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('falls back to the default language without modifying nor logging the consumer config', () => {
    const config = { opLingua: '', linsceApiUrl: '', uiLanguageJS: undefined };
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: LinSceConfigService, useValue: config }],
    });
    expect(TestBed.inject(LanguageService).operationLingua).toBe(DEFLIN);
    expect(config.opLingua).toBe('');
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('switches the operation language, dropping the labels of the previous one', () => {
    const formulas = (lingua: string, pcmt: string) => [{ formula: 'WDR', lingua, tags: [{ tag: 'Hi', pcmt }] }];
    service.switchLingua('fr', formulas('fr', 'Bonjour'));
    expect(service.operationLingua).toBe('fr');
    expect(service.label('WDR', 'Hi')).toBe('Bonjour');
    service.switchLingua('en', formulas('en', 'Hello'));
    expect(service.label('WDR', 'Hi')).toBe('Hello');
    service.switchLingua('x', []);
    expect(service.operationLingua).toBe(DEFLIN);
  });

  describe('configuration', () => {
    const create = (config: object): LanguageService => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), { provide: LinSceConfigService, useValue: config }],
      });
      return TestBed.inject(LanguageService);
    };

    it('uses the default server routes and the default document header', () => {
      const created = create({ opLingua: 'en', linsceApiUrl: 'http://api.test/', uiLanguageJS: undefined });
      expect(created.routes).toEqual(DEFAULT_LINSCE_ROUTES);
      expect(created.docHeaderTemplate).toBe(DEFAULT_DOC_HEADER);
    });

    it('replaces only the routes given by the consumer and calls them', () => {
      const created = create({
        opLingua: 'en', linsceApiUrl: 'http://api.test/', uiLanguageJS: undefined,
        routes: { linguas: 'v2/languages' }, docHeaderTemplate: '<b>header</b>',
      });
      expect(created.routes).toEqual({ ...DEFAULT_LINSCE_ROUTES, linguas: 'v2/languages' });
      expect(created.docHeaderTemplate).toBe('<b>header</b>');
      const http = TestBed.inject(HttpTestingController);
      http.expectOne('http://api.test/v2/languages');
      http.expectOne('http://api.test/api/Template/Customer/en');
    });
  });
});
