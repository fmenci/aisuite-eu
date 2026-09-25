
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EMPTYGUID, REXGUID, EMPTYID, REXCOMPRESSID } from '../../public-api';

export const compressIdValidator: ValidatorFn = (control: AbstractControl): Record<string, ValidationErrors> | null => {
  if (control.value === undefined) {
    return { undefinedId: { value: undefined } };
  }
  if (control.value === null) {
    return { nullId: { value: null } };
  }
  const forbidden = !REXCOMPRESSID.test(control.value);
  if (forbidden) {
    return { notId: { value: control.value } };
  }
  return null;
};

export const notEmptyCompressIdValidator: ValidatorFn = (control: AbstractControl): Record<string, ValidationErrors> | null => {
  if (control.value === EMPTYID) {
    return { emptyId: { value: control.value } };
  }
  return null;
};

export const guidValidator: ValidatorFn = (control: AbstractControl): Record<string, ValidationErrors> | null => {
  if (control.value === undefined) {
    return { undefinedGUID: { value: undefined } };
  }
  if (control.value === null) {
    return { nullGUID: { value: null } };
  }
  const forbidden = !REXGUID.test(control.value);
  return forbidden ? { notGUID: { value: control.value } } : null;
};

export const notEmptyGuidValidator: ValidatorFn = (control: AbstractControl): Record<string, ValidationErrors> | null => {
  if (control.value === EMPTYGUID) {
    return { emptyGUID: { value: control.value } };
  }
  return null;
};

export const amountValidator: ValidatorFn = (control: AbstractControl): Record<string, ValidationErrors> | null => {
  if (Math.abs(control.value) > 0.001) {
    return null;
  }
  return { amountError: { value: control.value } };
};

export const aiMetaModelValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const ctrname = control.get('name');
  if (ctrname == null) {
    return { metaEmptyError: true };
  }
  else {
    if ((ctrname.value === undefined) || (ctrname.value === null)) {
      return { metaEmptyError: true };
    }
    if (ctrname.value.length < 3) {
      return { nameTooShortError: { value: ctrname.value } };
    }
  }
  return null;
};

export const aiMetaModelCompressIdValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const ctrid = control.get('unicId');
  if (ctrid == null) {
    return { undefinedId: { value: null } };
  }
  if (ctrid.value === undefined) {
    return { undefinedId: { value: undefined } };
  }
  if (ctrid.value === null) {
    return { nullId: { value: null } };
  }
  const forbidden = !REXCOMPRESSID.test(ctrid.value);
  if (forbidden) {
    return { notId: { value: control.value } };
  }
  const ctrname = control.get('name');
  if (ctrname == null) {
    return { metaEmptyError: true };
  }
  if ((ctrname.value === undefined) || (ctrname.value === null)) {
    return { metaEmptyError: true };
  }
  if (ctrname.value.length < 3) {
    return { nameTooShortError: { value: ctrname.value } };
  }
  return null;
};

// UnicId can be new, therefore test only in case it exists
export const aiMetaModelCompressIdNewValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const ctrid = control.get('unicId');
  if (ctrid != null) {
    if ((ctrid.value === undefined) || (ctrid.value === null)) {
      // hence new
    }
    else {
      // otherwise test it is accepted
      const forbidden = !REXCOMPRESSID.test(ctrid.value);
      if (forbidden) {
        return { notId: { value: control.value } };
      }
    }
  }
  const ctrname = control.get('name');
  if (ctrname == null) {
    return { metaEmptyError: true };
  }
  if ((ctrname.value === undefined) || (ctrname.value === null)) {
    return { metaEmptyError: true };
  }
  if (ctrname.value.length < 3) {
    return { nameTooShortError: { value: ctrname.value } };
  }
  return null;
};

export const aiMetaModelGuidValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const ctrid = control.get('unicId');
  if (ctrid == null) {
    return { undefinedGUID: { value: null } };
  }
  if (ctrid.value === undefined) {
    return { undefinedGUID: { value: undefined } };
  }
  if (ctrid.value === null) {
    return { nullGUID: { value: null } };
  }
  const forbidden = !REXGUID.test(control.value);
  if (forbidden) {
    return { notGUID: { value: control.value } };
  }
  const ctrname = control.get('name');
  if (ctrname == null) {
    return { metaEmptyError: true };
  }
  if ((ctrname.value === undefined) || (ctrname.value === null)) {
    return { metaEmptyError: true };
  }
  if (ctrname.value.length < 3) {
    return { nameTooShortError: { value: ctrname.value } };
  }
  return null;
};

export const checkGMTDate = (val: Date | undefined): Date | null => {
  if (val === undefined) {
    return null;
  }
  let dt: Date = val;
  if (val) {
    const objType = Object.prototype.toString.call(val);
    if (objType === '[object String]') {
      dt = new Date(val);
      const y = dt.getFullYear();
      const m = dt.getMonth() + 1;
      const d = dt.getDate();
      const resp = y + '-' + ('00' + m).slice(-2) + '-' + ('00' + d).slice(-2);
      dt = new Date(resp);
    } else {
      const rtval: string = dt.getFullYear() + '-' + ('00' + dt.getMonth()).slice(-2) + '-' + ('00' + dt.getDate()).slice(-2);
      dt = new Date(rtval);
    }
  }
  return dt;
};

export const regmod = (theform: FormGroup, fields: string[]): Subscription[] => {
  const subz: Subscription[] = [];
  fields.forEach((field: string) => {
    const ctr = theform.get(field) as FormControl;
    subz.push(ctr.valueChanges.subscribe(() => {
      theform.patchValue({
        dmodAi: new Date()
      });
    }));
  });
  return subz;
};
