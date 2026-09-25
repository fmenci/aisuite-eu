import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observer } from 'rxjs';

import { DEFAULT_LINSCE_ROUTES } from '../api-config';
import { AISuiteMetaModel } from '../models/aisuite.meta.model';
import { FileLoaderModel } from '../models/fileloader.model';
import { DokoAPIDirective } from './doko.api.directive';
import { LanguageService } from './language.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('DokoAPIDirective', () => {
  const languageStub = { operationBaseUrl: 'http://api.test/', routes: DEFAULT_LINSCE_ROUTES };
  let directive: DokoAPIDirective;
  let httpMock: HttpTestingController;
  let trancheEvents: (string | undefined)[];
  let combineEvents: boolean[];
  let consoleError: ReturnType<typeof vi.spyOn>;

  const trancheUrl = () => `${languageStub.operationBaseUrl}api/Doko/Tranche`;
  const combineUrl = () => `${languageStub.operationBaseUrl}api/Doko/Combine`;
  // the combine call requests responseType 'string', which flush() refuses to convert: answer with a ready-made
  // response, then complete the request as a real backend does (event() alone leaves it open and blocks the queue)
  const answerCombine = (req: TestRequest, body: string) => {
    req.event(new HttpResponse({ body, status: 200 }));
    (req as unknown as { observer: Observer<unknown> }).observer.complete();
  };
  const failRequest = (req: TestRequest) => req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

  beforeEach(() => {
    languageStub.operationBaseUrl = 'http://api.test/';
    TestBed.configureTestingModule({
      providers: [
        DokoAPIDirective,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LanguageService, useValue: languageStub },
      ],
    });
    directive = TestBed.inject(DokoAPIDirective);
    httpMock = TestBed.inject(HttpTestingController);
    trancheEvents = [];
    combineEvents = [];
    directive.evtranche.subscribe((value: string | undefined) => trancheEvents.push(value));
    directive.evcombine.subscribe((value: boolean) => combineEvents.push(value));
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    consoleError.mockRestore();
  });

  describe('feedTranche', () => {
    it('should post the slice to the tranche endpoint and emit the response', () => {
      const flmodel = new FileLoaderModel('uid-1', 0, 'ZGF0YQ==', 'file.pdf', 'application/pdf');

      directive.feedTranche(flmodel);

      const req = httpMock.expectOne(trancheUrl());
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(flmodel);
      req.flush('uid-1');

      expect(trancheEvents).toEqual(['uid-1']);
    });

    it('should log the error and emit undefined when the slice cannot be written', () => {
      directive.feedTranche(new FileLoaderModel('uid-1', 0));

      failRequest(httpMock.expectOne(trancheUrl()));

      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('error writing file slice'));
      expect(trancheEvents).toEqual([undefined]);
    });

    it('should queue a call made while a slice is pending instead of cancelling it', () => {
      directive.feedTranche(new FileLoaderModel('', 1));
      directive.feedTranche(new FileLoaderModel('uid-1', 2));

      const first = httpMock.match(trancheUrl());
      expect(first.length).toBe(1);
      expect(first[0].request.body.tranche).toBe(1);
      expect(first[0].cancelled).toBe(false);

      first[0].flush('uid-1');
      expect(trancheEvents).toEqual(['uid-1']);

      const second = httpMock.match(trancheUrl());
      expect(second.length).toBe(1);
      expect(second[0].request.body.tranche).toBe(2);
      second[0].flush('uid-1');

      expect(trancheEvents).toEqual(['uid-1', 'uid-1']);
    });

    it('should keep processing the queue after a failed slice', () => {
      directive.feedTranche(new FileLoaderModel('', 1));
      directive.feedTranche(new FileLoaderModel('', 2));

      failRequest(httpMock.match(trancheUrl())[0]);
      expect(trancheEvents).toEqual([undefined]);

      const second = httpMock.match(trancheUrl());
      expect(second.length).toBe(1);
      second[0].flush('uid-2');

      expect(trancheEvents).toEqual([undefined, 'uid-2']);
    });

    it.each(['', '/', 'https://api.test/'])('should build the url from the configured base "%s"', (base: string) => {
      languageStub.operationBaseUrl = base;

      directive.feedTranche(new FileLoaderModel('uid-1', 0));

      httpMock.expectOne(`${base}api/Doko/Tranche`).flush('uid-1');
    });
  });

  describe('combine', () => {
    it('should post the id to the combine endpoint and emit true when the server echoes the id', () => {
      directive.combine('uid-1');

      const req = httpMock.expectOne(combineUrl());
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(new AISuiteMetaModel('uid-1'));
      answerCombine(req, 'uid-1');

      expect(combineEvents).toEqual([true]);
    });

    it('should emit false when the server answers another id', () => {
      directive.combine('uid-1');

      answerCombine(httpMock.expectOne(combineUrl()), 'uid-2');

      expect(combineEvents).toEqual([false]);
    });

    it('should log the error and emit false when the media cannot be written', () => {
      directive.combine('uid-1');

      failRequest(httpMock.expectOne(combineUrl()));

      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('error writing media'));
      expect(combineEvents).toEqual([false]);
    });

    it('should queue a call made while a combine is pending instead of cancelling it', () => {
      directive.combine('uid-1');
      directive.combine('uid-2');

      const first = httpMock.match(combineUrl());
      expect(first.length).toBe(1);
      expect(first[0].request.body).toEqual(new AISuiteMetaModel('uid-1'));
      expect(first[0].cancelled).toBe(false);

      answerCombine(first[0], 'uid-1');
      expect(combineEvents).toEqual([true]);

      const second = httpMock.match(combineUrl());
      expect(second.length).toBe(1);
      expect(second[0].request.body).toEqual(new AISuiteMetaModel('uid-2'));
      answerCombine(second[0], 'uid-2');

      expect(combineEvents).toEqual([true, true]);
    });

    it.each(['', '/', 'https://api.test/'])('should build the url from the configured base "%s"', (base: string) => {
      languageStub.operationBaseUrl = base;

      directive.combine('uid-1');

      answerCombine(httpMock.expectOne(`${base}api/Doko/Combine`), 'uid-1');
    });
  });
});
