import { InjectionToken } from "@angular/core";

/** Server routes used by the library, relative to `LinSceConfig.linsceApiUrl` */
export interface LinSceRoutes {
  /** GET, list of the available languages */
  linguas: string;
  /** POST, reports the tags in use */
  tagCall: string;
  /** GET, header template of the documents, the operation language is appended */
  customerTemplate: string;
  /** POST, upload of one slice of a file */
  dokoTranche: string;
  /** POST, combines the uploaded slices */
  dokoCombine: string;
}

export const DEFAULT_LINSCE_ROUTES: LinSceRoutes = {
  linguas: 'api/WorldDesk/Linguas',
  tagCall: 'api/WorldDesk/AjaxCallTag',
  customerTemplate: 'api/Template/Customer',
  dokoTranche: 'api/Doko/Tranche',
  dokoCombine: 'api/Doko/Combine'
};

/** One formula with its tags, as exported by the server (`uiLanguageJS`) */
export interface LinSceExportFormula {
  formula: string;
  lingua: string;
  tags: { tag: string; pcmt: string }[];
}

export interface LinSceConfig {
  opLingua: string;
  linsceApiUrl?: string
  uiLanguageJS: string | LinSceExportFormula[] | undefined;
  /** Overrides the default server routes, only the given ones are replaced */
  routes?: Partial<LinSceRoutes>;
  /** Header template of the documents until the server provides one, defaults to the signature of the library creator */
  docHeaderTemplate?: string;
}

export const LinSceConfigService = new InjectionToken<LinSceConfig>('LinSceConfig');
