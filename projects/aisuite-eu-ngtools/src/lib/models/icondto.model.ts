
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

import { IconTypeEnum } from './icontype.enum';

export class IconDtoModel {
  constructor(
    public iconType?: IconTypeEnum,
    public iconValue?: string,
    public iconTitle?: string
  ) { }
}
