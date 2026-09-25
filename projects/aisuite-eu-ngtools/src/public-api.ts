/*
 * Public API Surface of aisuite-ngtools
 */

/*
//    ---------------------------------------------------------
//    ---     AISuite typescript tools         ---
//    ---     use constants   ---
//    ---------------------------------------------------------
//
*/

export const EMPTYGUID = '00000000-0000-0000-0000-000000000000';
export const REXGUID = /^[A-F0-9]{8}(?:-[A-F0-9]{4}){3}[A-F0-9]{8}$/i;
export const DECIMALMIN = 0.01;
export const EMPTYID = 'AAAAAAAAAAAAAAAAAAAAAA';
export const REXCOMPRESSID = /^[A-Z0-9_-]{22}$/i;

export * from './lib/components/flagbutton.component';
export * from './lib/models/iajax.response';
export * from './lib/models/iajaxsingle.response';
export * from './lib/models/ilingua.flag';
export * from './lib/models/languageformula.model';
export * from './lib/models/languagetag.model';
export * from './lib/models/linguaquery.model';
export * from './lib/services/language.service';
export * from './lib/services/linsce.pipe';
export * from './lib/services/timedelay.directive';
export * from './lib/api-config';
export * from './lib/aisuite-ngtools.component';
export * from './lib/provide-aisuite-ngtools';
/*
 * Public API Surface of aisuite-dokoged
 */

export * from './lib/components/aisuite-dokoged.service';
export * from './lib/components/aisuite-dokoged.component';
export * from './lib/models/downloadfile.model';
export * from './lib/models/fileloader.model';
export * from './lib/models/aisuite.meta.model';
export * from './lib/services/doko.api.directive';
export * from './lib/services/exportxml.directive';
export * from './lib/services/modalhost.directive';

/*
*   Public API Surface of formreactive
*/
export * from './lib/components/aicontrol.list.component';
export * from './lib/components/currency.ctr.component';
export * from './lib/components/date.ctr.component';
export * from './lib/components/iconselector.control.component';
export * from './lib/components/icontype.ctr.component';
export * from './lib/components/limitslider';
export * from './lib/components/lingua.control.component';
export * from './lib/components/numeral.ctr.component';
export * from './lib/components/selector.control.component';
export * from './lib/models/aisuitecore.listitem.model';
export * from './lib/models/aisuiteselect.model';
export * from './lib/models/currency.enum';
export * from './lib/models/currencyconversion.model';
export * from './lib/models/daterange.model';
export * from './lib/models/icondto.model';
export * from './lib/models/icontype.enum';
export * from './lib/models/limits.model';
export * from './lib/services/formreactive.helpers';
export * from './lib/services/livelylist.directive';
