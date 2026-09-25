import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LinSceConfigService } from '../api-config';
import { LanguageService } from '../services/language.service';
import { AisuiteDokogedService } from './aisuite-dokoged.service';

describe('AisuiteDokogedService', () => {
  let service: AisuiteDokogedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LinSceConfigService, useValue: { opLingua: 'en', linsceApiUrl: '', uiLanguageJS: undefined } },
      ],
    });
    service = TestBed.inject(AisuiteDokogedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

/*
 * Contract tests, see models.contract.spec.ts: what applications using AisuiteDokogedService rely on.
 *  - open(show, url) asks the modal to open (or close), url is the application call made when a file arrived,
 *  - close() emits `closed`,
 *  - when the modal reports a file arrived (arrived(id)) the service posts { unicId: id } to url and emits
 *    `evdokoOK` with the body of the answer.
 */
describe('AisuiteDokogedService contract', () => {
  const languages = { operationBaseUrl: 'http://api.test/' };
  let service: AisuiteDokogedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LanguageService, useValue: languages },
      ],
    });
    service = TestBed.inject(AisuiteDokogedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('is provided in root', () => {
    expect(TestBed.inject(AisuiteDokogedService)).toBe(service);
  });

  it('asks the modal to open, after a short delay, on open(true)', () => {
    vi.useFakeTimers();
    const requests: boolean[] = [];
    service.opened.event.subscribe((show: boolean) => requests.push(show));

    service.open(true, 'api/Export/Xml');
    expect(requests).toEqual([]);
    vi.advanceTimersByTime(300);
    expect(requests).toEqual([true]);
  });

  it('asks the modal to close on open(false)', () => {
    vi.useFakeTimers();
    const requests: boolean[] = [];
    service.opened.event.subscribe((show: boolean) => requests.push(show));

    service.open(false, 'api/Export/Xml');
    vi.advanceTimersByTime(300);
    expect(requests).toEqual([false]);
  });

  it('emits closed on close()', () => {
    let closed = 0;
    service.closed.subscribe(() => closed++);
    service.close();
    expect(closed).toBe(1);
  });

  it('posts the id of the arrived file to the url given to open(), then emits evdokoOK with the body of the answer', () => {
    vi.useFakeTimers();
    service.open(false, 'api/Export/Xml');
    const answers: string[] = [];
    service.evdokoOK.subscribe((body: string) => answers.push(body));

    service.arrived('doko-guid');
    const request = httpMock.expectOne('http://api.test/api/Export/Xml');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ unicId: 'doko-guid' });
    expect(answers).toEqual([]);

    request.flush({ body: '<xml/>' });
    expect(answers).toEqual(['<xml/>']);
  });

  it('does not emit evdokoOK when the answer is empty', () => {
    service.open(false, 'api/Export/Xml');
    const answers: string[] = [];
    service.evdokoOK.subscribe((body: string) => answers.push(body));

    service.arrived('doko-guid');
    httpMock.expectOne('http://api.test/api/Export/Xml').flush(null);
    expect(answers).toEqual([]);
  });

  it('logs the error and does not emit evdokoOK when the call fails', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    service.open(false, 'api/Export/Xml');
    const answers: string[] = [];
    service.evdokoOK.subscribe((body: string) => answers.push(body));

    service.arrived('doko-guid');
    httpMock.expectOne('http://api.test/api/Export/Xml').flush('boom', { status: 500, statusText: 'Server Error' });
    expect(answers).toEqual([]);
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
