# demo
Angular 22 application showing the components of `@aisuite-eu/ngtools`, found in `projects/aisuite-eu-ngtools`. It uses the library source directly
(path mapping `@aisuite-eu/ngtools` in `tsconfig.json`), so a change in the library is seen at once.

```
npm start
```

## Tabs
One single page, no routing. Each tab is loaded when first opened (`@defer`) and kept afterwards, so a page keeps its state when leaving it.
Tabs follow the ARIA pattern: arrows, Home and End move between them.

| Tab | Components |
|---|---|
| Value inputs | `ais-numeral-input`, `ais-currency-input`, `ais-datectr-input`, `ais-icontype-input`, `ais-limitslider` |
| Lists and icons | `ais-control-selector`, `ais-aicontrol-list`, `ais-icon-selector` |
| Languages | `ais-lingua-selector`, `ais-flag-button` |
| LinSce labels | `linsceLocalisation` pipe, `ais-linsce-display`, language switch with `ais-flag-button` |
| Document upload | `ais-aisuite-dokoged` |
| Validators and helpers | validators of `formreactive.helpers` |

## Mocked server
The library needs an AI Suite server. `src/app/mock` stands for it: an HTTP interceptor answers languages, labels and file upload,
`demo-data.ts` holds the flags, the labels (en, fr, de, it, es) and the lists. Replace it by a real `linsceApiUrl` in `app.config.ts` to use a real server.

## Notes
- The application starts once the languages are loaded: the flag components read them only once, when created.
- The library components use default change detection and timers, hence `zone.js` and `provideZoneChangeDetection`.
- Bootstrap 5 and Font Awesome are expected by the components; the few classes they need from the host are in `src/styles.less`.
- Flags are in `public/assets/flags`, add `Flag_of_<country>.svg` and an entry in `DEMO_FLAGS` to offer another language.

## Licence
This software is provided under GNU GPL v3 licence.
Copyright (c) 2008/2021 Franck Menci

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published 
by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or 
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

