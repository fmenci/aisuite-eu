
/*
//    ---------------------------------------------------------
//    ---     AISuite typescript tools         ---
//    ---     Ajax response model    ---
//    ---------------------------------------------------------
//    Provided server side message
*/

export interface IAjaxResponse<T> {
  success: boolean;
  valid: boolean;
  message: string;
  count: number;
  data: T[];
}
