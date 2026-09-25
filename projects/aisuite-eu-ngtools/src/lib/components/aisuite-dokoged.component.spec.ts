import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reflectComponentType } from '@angular/core';
import { Observer } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LINSCE_ROUTES, LinSceConfigService } from '../api-config';
import { DokoAPIDirective } from '../services/doko.api.directive';
import { LanguageService } from '../services/language.service';
import { AisuiteDokogedComponent } from './aisuite-dokoged.component';
import { AisuiteDokogedService } from './aisuite-dokoged.service';

describe('AisuiteDokogedComponent', () => {
  let component: AisuiteDokogedComponent;
  let fixture: ComponentFixture<AisuiteDokogedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AisuiteDokogedComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DokoAPIDirective,
        { provide: LinSceConfigService, useValue: { opLingua: 'en', linsceApiUrl: '', uiLanguageJS: undefined } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AisuiteDokogedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/*
 * Contract tests, see models.contract.spec.ts: what applications using <ais-aisuite-dokoged> rely on.
 * The modal is opened and closed through AisuiteDokogedService. It uploads the files the user picks or drops slice
 * by slice (api/Doko/Tranche), asks the server to combine them (api/Doko/Combine) and finally tells the service
 * the file arrived, which triggers the application call given to service.open(). Every text comes from the
 * `WDR` formula of the LanguageService: the tags are data of the language database.
 */
describe('AisuiteDokogedComponent contract', () => {
  const languages = {
    operationBaseUrl: 'http://api.test/',
    routes: DEFAULT_LINSCE_ROUTES,
    label: vi.fn((formula: string, tag: string) => `${formula}.${tag}`),
  };
  const trancheUrl = 'http://api.test/api/Doko/Tranche';
  const combineUrl = 'http://api.test/api/Doko/Combine';
  const xmlUrl = 'http://api.test/api/Export/Xml';

  let fixture: ComponentFixture<AisuiteDokogedComponent>;
  let service: AisuiteDokogedService;
  let httpMock: HttpTestingController;

  const modal = () => fixture.nativeElement.querySelector('.modal') as HTMLElement;
  const status = () => fixture.nativeElement.querySelector('output.drop-zone-status')!.textContent!.trim();
  const fileInput = () => fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
  const dropZone = () => fixture.nativeElement.querySelector('.drop-zone-active') as HTMLElement;
  const queue = () => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('li strong')).map(e => e.textContent);
  const pick = (...files: File[]) => {
    const transfer = new DataTransfer();
    files.forEach(file => transfer.items.add(file));
    fileInput().files = transfer.files;
    fileInput().dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };
  const nextTranche = async () => {
    let request!: TestRequest;
    // the slice is read by a FileReader: it comes later
    await vi.waitFor(() => { request = httpMock.expectOne(trancheUrl); });
    return request;
  };
  // the combine call requests responseType 'string', which flush() refuses to convert: answer with a ready-made
  // response, then complete the request as a real backend does
  const answerCombine = (request: TestRequest, body: string) => {
    request.event(new HttpResponse({ body, status: 200 }));
    (request as unknown as { observer: Observer<unknown> }).observer.complete();
  };

  beforeEach(() => {
    languages.label.mockClear();
    TestBed.configureTestingModule({
      imports: [AisuiteDokogedComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DokoAPIDirective,
        { provide: LanguageService, useValue: languages },
      ],
    });
    service = TestBed.inject(AisuiteDokogedService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AisuiteDokogedComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('is the standalone component <ais-aisuite-dokoged>, without input nor output', () => {
    const mirror = reflectComponentType(AisuiteDokogedComponent)!;
    expect(mirror.selector).toBe('ais-aisuite-dokoged');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.inputs).toEqual([]);
    expect(mirror.outputs).toEqual([]);
  });

  describe('modal', () => {
    beforeEach(() => vi.useFakeTimers());

    it('is hidden until the service opens it', () => {
      expect(modal().style.display).toBe('none');
    });

    it('opens on service.open(true) and closes on service.open(false)', () => {
      service.open(true, 'api/Export/Xml');
      vi.advanceTimersByTime(300);
      vi.advanceTimersByTime(200);
      fixture.detectChanges();
      expect(modal().style.display).toBe('block');
      expect(modal().style.opacity).toBe('1');
      expect(modal().classList).toContain('in');

      vi.advanceTimersByTime(800); // the modal ignores hide requests for a moment after it opens
      service.open(false, 'api/Export/Xml');
      vi.advanceTimersByTime(300);
      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(modal().style.display).toBe('none');
    });

    it('closes with its close button', () => {
      service.open(true, 'api/Export/Xml');
      vi.advanceTimersByTime(1500);
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('.btn-close') as HTMLElement).click();
      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(modal().style.display).toBe('none');
    });
  });

  describe('texts', () => {
    it('asks the WDR formula for the tags of the modal', () => {
      expect(languages.label).toHaveBeenCalledWith('WDR', 'GedModalTitle');
      expect(languages.label).toHaveBeenCalledWith('WDR', 'GedFileToolLabel');
      expect(languages.label).toHaveBeenCalledWith('WDR', 'GedDropLabel');
      expect(fixture.nativeElement.querySelector('.modal-title').textContent.trim()).toBe('WDR.GedModalTitle');
    });

    it('asks the WDR formula for the drop effect while a file is dragged over', () => {
      const event = new DragEvent('dragover', { dataTransfer: new DataTransfer(), cancelable: true });
      dropZone().dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(languages.label).toHaveBeenCalledWith('WDR', 'GedDropEffect');
    });

    it('says so when it is asked to upload without file', () => {
      pick();
      expect(status()).toBe('WDR.GedNoFileMessage');
    });
  });

  describe('upload', () => {
    beforeEach(() => {
      // the application call triggered once a file arrived
      service.open(false, 'api/Export/Xml');
    });

    it('sends a small file in one slice, then asks the server to combine, then triggers the application call', async () => {
      const applicationAnswers: string[] = [];
      service.evdokoOK.subscribe((body: string) => applicationAnswers.push(body));

      pick(new File(['hello'], 'a.txt', { type: 'text/plain' }));
      expect(fixture.nativeElement.querySelector('.progress')).not.toBeNull();
      expect(languages.label).toHaveBeenCalledWith('WDR', 'GedQueueLabel');

      const tranche = await nextTranche();
      expect(tranche.request.method).toBe('POST');
      expect(tranche.request.body).toEqual({
        unicId: '', tranche: 1, data: btoa('hello'), fileName: 'a.txt', mimeType: 'text/plain',
      });
      tranche.flush('doko-guid');

      const combine = httpMock.expectOne(combineUrl);
      expect(combine.request.method).toBe('POST');
      expect(combine.request.body).toEqual({ unicId: 'doko-guid' });
      vi.useFakeTimers();
      answerCombine(combine, 'doko-guid');
      fixture.detectChanges();
      expect(status()).toBe('WDR.GedFileLoadedMessage a.txt');
      expect(fixture.componentInstance.percentloaded).toBe(100);

      vi.advanceTimersByTime(1300);
      const trigger = httpMock.expectOne(xmlUrl);
      expect(trigger.request.body).toEqual({ unicId: 'doko-guid' });
      trigger.flush({ body: '<xml/>' });
      expect(applicationAnswers).toEqual(['<xml/>']);
      expect(fixture.componentInstance.readActive).toBe(false);
    });

    it('slices a big file without losing nor repeating a byte, the id given by the first slice is used for the others', async () => {
      const bytes = Uint8Array.from({ length: 25600 }, (_, i) => i % 251);
      pick(new File([bytes], 'big.bin', { type: 'application/octet-stream' }));

      const received: number[][] = [];
      for (let slice = 1; slice <= 3; slice++) {
        const tranche = await nextTranche();
        expect(tranche.request.body).toMatchObject({
          unicId: slice === 1 ? '' : 'doko-guid', tranche: slice, fileName: 'big.bin', mimeType: 'application/octet-stream',
        });
        received.push(Array.from(atob(tranche.request.body.data), char => char.charCodeAt(0)));
        tranche.flush('doko-guid');
      }
      expect(httpMock.expectOne(combineUrl).request.body).toEqual({ unicId: 'doko-guid' });
      expect(received.flat()).toEqual(Array.from(bytes));
    });

    it('uploads the picked files one after the other, in the order they were picked, listing those waiting', async () => {
      pick(new File(['1'], 'first.txt'), new File(['2'], 'second.txt'));
      expect(queue()).toEqual(['second.txt']);
      const tranche = await nextTranche();
      expect(tranche.request.body.fileName).toBe('first.txt');
    });

    it('starts uploading the files dropped on the drop zone', async () => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['hello'], 'dropped.txt', { type: 'text/plain' }));
      const event = new DragEvent('drop', { dataTransfer: transfer, cancelable: true, bubbles: true });
      dropZone().dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      const tranche = await nextTranche();
      expect(tranche.request.body).toMatchObject({ fileName: 'dropped.txt', mimeType: 'text/plain' });
    });

    it('reports a failure when a slice is refused', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      pick(new File(['hello'], 'a.txt', { type: 'text/plain' }));
      const tranche = await nextTranche();
      vi.useFakeTimers();
      tranche.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      fixture.detectChanges();
      expect(status()).toBe('WDR.GedFileFailedMessage a.txt');
      httpMock.expectNone(combineUrl);
    });
  });
});
