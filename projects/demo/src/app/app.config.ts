import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { filter, firstValueFrom, interval } from 'rxjs';
import { DokoAPIDirective, LanguageService, provideAisuiteNgtools } from '@aisuite-eu/ngtools';
import { demoLabels } from './mock/demo-data';
import { DemoListsService } from './mock/demo-lists.service';
import { mockBackendInterceptor } from './mock/mock-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // the library components rely on default change detection and timers
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([mockBackendInterceptor])),
    provideAisuiteNgtools({ opLingua: 'en', linsceApiUrl: '', uiLanguageJS: demoLabels('en') }),
    DokoAPIDirective,
    provideAppInitializer(() => {
      inject(DemoListsService);
      // the flag components read the languages once, so the app starts when the server has answered
      const languages = inject(LanguageService);
      return firstValueFrom(interval(20).pipe(filter(() => languages.linguas.length > 0)));
    })
  ]
};
