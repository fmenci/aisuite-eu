# AISuite Project Tools for typescript
Version 14, library ready for npm publishing, typescript modules and service used by the rest of the application.
    - Timedelay directive : trigger an event and return object in new state
    - Linces Module, provides access to labeling in the World Desk Reference database for AI Suite

08/03/2021 : concentrated into AISuiteModule (aisuite.module.ts  and ged.module.ts)
10/08/2021 : linsce call to repo using API ; require Angular module call API on same url root, variable is set in Environment, NO CROSS SITE SCRIPTING ALLOWED
11/10/2022 : make it into package for npm => aisuite-ngtools
    how to : https://www.geekstrick.com/lesson/generate-an-angular-library/
03/11/2022 : integrate Form reactive components
21/03/2023 : angular v15 breaking change on this.fb.group...
20/10/2023 : angular v16
18/10/2024 : test angular v18
24/01/2025 : new deploy
28/03/2025 : form reactive validation on compressed id
16/04/2025 : form reactive validation on empty compressed id
01/11/2025 : test angular v19
04/11/2025 : test angular v20
02/07/2026 : test angular v21
02/09/2026 : test angular v22 (start using Claude Code)
09/09/2026 : update all package to latest
21/09/2026 : add unit testing to library
24/09/2026 : 3.0.0 first version for npm as @aisuite-eu/ngtools, BREAKING CHANGES for consumers
    - package renamed aisuite-ngtools => @aisuite-eu/ngtools (project folder is projects/aisuite-eu-ngtools)
    - component selectors prefix lib- => ais- (ais-currency-input, ais-limitslider, ...) and directive [libModalHost] => [aisModalHost]
    - provideAisuiteTstools => provideAisuiteNgtools, AisuiteTstoolsComponent => AisuiteNgtoolsComponent
    - LocalisePipe => LinScePipe, template pipe 'localise' => 'linsceLocalisation'
    - LinSceConfig and LinSceConfigService are exported (typing of the config, override of the token in tests)
    - LanguageService no longer modifies the config object given by the application, nor logs to the console at start
    - lint clean, tests with coverage (npm run test:lib), rxjs declared as peer dependency, CommonModule dropped for NgClass/NgStyle
    - aisuite-ngtools.module.ts renamed provide-aisuite-ngtools.ts, new type LinSceExportFormula for uiLanguageJS
    - new optional config : routes (server routes, LinSceRoutes, DEFAULT_LINSCE_ROUTES) and docHeaderTemplate (default : AISuite signature)
    - peerDependencies loosened to Angular >=21 <23 (only tested on Angular 22)
    - LICENSE.txt added to the package, package.json metadata completed (homepage, bugs, keywords, public access)
    - LanguageService.switchLingua(lingua, uiLanguageJS) changes the operation language, linsceLocalisation pipe takes the language as optional 3rd argument to be re-evaluated
