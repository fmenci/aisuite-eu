import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';
import { FileLoaderModel } from '@aisuite-eu/ngtools';
import { DEMO_FLAGS } from './demo-data';

/** URL called by the upload demo once a file is stored, see DokoPage */
export const DEMO_XML_ROUTE = 'api/Demo/Xml';

/** Stands for the AI Suite server, so that the demo runs on its own */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const reply = (body: unknown) => of(new HttpResponse({ status: 200, body })).pipe(delay(120));
  if (req.url.endsWith('WorldDesk/Linguas')) {
    return reply({ success: true, valid: true, message: '', count: DEMO_FLAGS.length, data: DEMO_FLAGS });
  }
  if (req.url.includes('Template/Customer')) {
    return reply({ success: true, valid: true, message: '', data: 'Demo document header' });
  }
  if (req.url.endsWith('WorldDesk/AjaxCallTag')) {
    return reply(null);
  }
  if (req.url.endsWith('Doko/Tranche')) {
    const slice = req.body as FileLoaderModel;
    return reply(slice.unicId || crypto.randomUUID());
  }
  if (req.url.endsWith('Doko/Combine')) {
    return reply((req.body as { unicId: string }).unicId);
  }
  if (req.url.endsWith(DEMO_XML_ROUTE)) {
    return reply({ body: `<document id="${(req.body as { unicId: string }).unicId}" />` });
  }
  return next(req);
};
