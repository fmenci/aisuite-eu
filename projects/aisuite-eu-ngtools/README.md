# @aisuite-eu/ngtools
Angular tools of AI Suite (aisuite.eu): **LinSce** labeling (localisation) against the AI Suite backend, document upload,
reactive form controls and helpers. Standalone components and services, Angular 21 and 22 (`>=21 <23`, tested on 22).

> **Requires an AI Suite backend.** The library talks to an AI Suite server on a single API root, cross site calls are not supported.
> Without that server the LinSce labels and the Doko upload have nothing to talk to. The form controls, validators and
> helpers work on their own.

## Compatibility
| @aisuite-eu/ngtools | Angular | rxjs |
|---|---|---|
| 3.x | `>=21 <23` (built and tested on 22) | `^7.4` |

Peer dependencies: `@angular/common`, `@angular/core`, `@angular/forms`, `rxjs`.

## Install
```
npm install @aisuite-eu/ngtools
```

## Setup
Provide the configuration once, and `provideHttpClient()`, in `bootstrapApplication`:
```ts
import { provideAisuiteNgtools } from '@aisuite-eu/ngtools';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAisuiteNgtools({ opLingua: 'en', linsceApiUrl: 'https://my.server/', uiLanguageJS: undefined }),
  ]
});
```
| Option | Description |
|---|---|
| `opLingua` | operation language, 2 letters or more, falls back to `en` when missing |
| `linsceApiUrl` | API root, prepended to every route |
| `uiLanguageJS` | user interface languages |
| `routes` | optional, replaces some of the server routes: `linguas`, `tagCall`, `customerTemplate`, `dokoTranche`, `dokoCombine` (defaults in `DEFAULT_LINSCE_ROUTES`) |
| `docHeaderTemplate` | optional, header of the documents, defaults to the AI Suite signature until the server provides one |

The config object is never modified by the library. `LinSceConfig` and `LinSceConfigService` are exported, e.g. to provide a test configuration.

A form control example, all controls are `ControlValueAccessor`:
```ts
import { CurrencyInputComponent } from '@aisuite-eu/ngtools';
// @Component({ imports: [ReactiveFormsModule, CurrencyInputComponent] })
```
```html
<ais-currency-input formControlName="amount" />
```

## LinSce labels
```html
{{ 'GedModalTitle' | linsceLocalisation : 'WDR' }}
```
`LinScePipe` (pipe `linsceLocalisation`) returns the label of a tag for a formula, in the operation language, through `LanguageService`.

To let the user change the language, give `LanguageService` the labels of the new language (the `uiLanguageJS` export of the server) and pass the
language to the pipe as 3rd argument, so that it is evaluated again:
```ts
this.languages.switchLingua('fr', labelsOfFrench);   // labelsOfFrench: string | LinSceExportFormula[]
this.lingua.set('fr');
```
```html
{{ 'GedModalTitle' | linsceLocalisation : 'WDR' : lingua() }}
```
`ais-flag-button` is meant to trigger it, see the demo (tab LinSce labels).

## Contents
- **Components** (selectors prefixed `ais-`): `ais-flag-button`, `ais-lingua-selector`, `ais-aisuite-dokoged`, `ais-linsce-display`
- **Form controls** (`ControlValueAccessor`): `ais-currency-input`, `ais-datectr-input`, `ais-numeral-input`, `ais-icontype-input`,
  `ais-icon-selector`, `ais-limitslider`, `ais-control-selector`, `ais-aicontrol-list`
- **Directives and services**: `TimeDelayDirective` (trigger an event and return object in new state), `DokoAPIDirective`, `ExportXMLDirective`,
  `ModalHostDirective` (`[aisModalHost]`), `LivelyListDirective`, `LanguageService`, `AisuiteDokogedService`
- **Form helpers**: validators for compressed ids, guids, amounts and AI Suite meta models, `checkGMTDate`, `regmod`
- **Models**: the business and lingua models, currency and icon enums

See [changelog.md](changelog.md) for the versions and the breaking changes.

## Licence
This software is provided under GNU GPL v3 licence.
Copyright (c) 2008/2021 Franck Menci

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published 
by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or 
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

