import { Provider } from '@angular/core';
import { LinSceConfig, LinSceConfigService } from './api-config';

/*
//    ---------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools           ---
//    ---------------------------------------------------------
//
// Configures the aisuite-ngtools standalone components/services for the app.
// Use in bootstrapApplication's providers array, in place of the former
// AisuiteNgtoolsModule.forRoot(config) NgModule import.
*/
export function provideAisuiteNgtools(config: LinSceConfig): Provider[] {
  return [
    { provide: LinSceConfigService, useValue: config }
  ];
}
