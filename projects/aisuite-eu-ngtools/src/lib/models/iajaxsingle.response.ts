/*
//    ---------------------------------------------------------
//    ---     AISuite typescript tools         ---
//    ---     Ajax response model for single object    ---
//    ---------------------------------------------------------
//    Provided server side message
*/

export interface IAjaxSingleResponse<T> {
  success: boolean;
  valid: boolean;
  message: string;
  data: T;
}
