import { Component, forwardRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { decimalPoint } from '../decimal.point';
import { LimitsModel } from '../models/limits.model';


@Component({
    selector: 'ais-limitslider',
    templateUrl: './limitslider.html',
    styleUrls: ['./limitslider.less'],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LimitSliderComponent),
            multi: true,
        }],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class LimitSliderComponent implements ControlValueAccessor {

    @Input() small = false;
    @Input() disabled = false;
    @Input() limits: LimitsModel = new LimitsModel(
        'slider', 0, 250, 1500, 10000, Infinity, 2, 1,
        'physical limit ({0} to {1})',
        'Limit low is reached {0}',
        'Limit high is exceeded {0}'
    );
    @Input() minuilimit = 0;
    @Input() maxuilimit = Infinity;

    public alertmessage: string | undefined = '';

    private innercur = '0';
    private curval = 0;
    private sliderval = 0;


    touch() {
        this.onTouched();
    }

    writeValue(val: number): void {
        this.cur = this.display(val);
    }

    registerOnChange(fn: (val: number) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    get cur(): string {
        return this.innercur;
    }
    set cur(value: string) {
        this.innercur = value;
        this.verifycur(value);
    }

    get sliderpos(): number {
        return this.sliderval;
    }
    set sliderpos(value: number) {
        this.sliderval = value;
        this.verifyslider(value);
    }

    get step(): number {
        if (this.limits.step !== undefined) {
            return this.limits.step;
        }
        let span = Math.round((this.limits.highband - this.limits.lowband) / 100);
        const precision = Math.pow(10, -this.limits.decimalaccuracy);
        if (Math.abs(span) < precision) {
            span = precision;
        } else if (span < 0) {
            span = -span;
        }
        return span;
    }

    get isAlarmOn(): boolean {
        if (this.curval < this.limits.lowband) {
            this.alertmessage = this.limits.alertlow?.replace(/\{0\}/g, this.display(this.limits.lowband));
        }
        if (this.curval > this.limits.highband) {
            this.alertmessage = this.limits.alerthigh?.replace(/\{0\}/g, this.display(this.limits.highband));
        }
        return (this.uiAlarm === true) || ((this.curval < this.limits.lowband) || (this.curval > this.limits.highband));
    }

    get uiAlarm(): boolean {
        const chk = ((this.curval <= this.minuilimit) || (this.curval >= this.maxuilimit));
        if (chk === true) {
            this.alertmessage = this.limits.limitPhysicMessage.replace(/\{0\}/g, this.display(this.minuilimit)).replace(/\{1\}/g, this.display(this.maxuilimit));
        }
        return chk;
    }

    validatecur(value: string) {
        this.verifycur(value);
        if (this.curval < this.limits.lowno) {
            this.cur = this.display(this.limits.lowno);
        } else if (this.curval > this.limits.highno) {
            this.cur = this.display(this.limits.highno);
        }
        this.onTouched();
    }

    verifycur(value: string) {
        let pf = 0;
        if (value !== null) {
            pf = Number(value);
            if (isNaN(pf)) {
                pf = parseFloat(value.replace(/\s/g, '').replace(decimalPoint(), '.'));
            }
        }
        this.curval = pf;
        pf = this.canonicalnumber(pf);
        if ((pf >= this.limits.lowband) && (pf <= this.limits.highband)) {
            this.sliderval = pf;
        } else if (pf < this.limits.lowband) {
            this.sliderval = this.limits.lowband;
        } else if (pf > this.limits.highband) {
            this.sliderval = this.limits.highband;
        }
        if (!this.disabled) {
            this.onChange(pf);
        }
    }

    validateslider(value: number) {
        this.verifyslider(value);
        this.onTouched();
    }

    verifyslider(value: number) {
        const pf = this.canonicalnumber(value);
        if (pf < this.limits.lowband) {
            this.sliderpos = this.limits.lowband;
        } else if (pf > this.limits.highband) {
            this.sliderpos = this.limits.highband;
        } else {
            if (this.display(pf) !== this.innercur) {
                this.innercur = this.display(pf);
                this.curval = pf;
                if (!this.disabled) {
                    this.onChange(pf);
                }
            }
        }
    }

    canonicalnumber(value: number): number {
        let fv = 0;
        if (value) {
            const nbsig = this.limits.decimalaccuracy + this.limits.storeprecision;
            fv = Number(Math.round(Number(value + 'e' + nbsig)) + 'e-' + nbsig);
        }
        return fv;
    }

    display(value: number): string {
        let fv = '0';
        if (value) {
            fv = value.toFixed(this.limits.decimalaccuracy).toString().replace('.', decimalPoint());
        }
        return fv;
    }

    onKey(event: KeyboardEvent) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                // TODO : cycle through active components (event to app level)
                break;
            case 'ArrowUp':
                this.curval = this.limits.highband;
                if (this.limits.highband > this.maxuilimit) {
                    this.curval = this.maxuilimit;
                }
                break;
            case 'ArrowDown':
                this.curval = this.limits.lowband;
                if (this.limits.lowband < this.minuilimit) {
                    this.curval = this.minuilimit;
                }
                break;
            case 'ArrowLeft':
                this.curval = this.curval - this.step
                if (this.curval < this.limits.lowno) {
                    this.curval = this.limits.lowno;
                }
                if (this.curval < this.minuilimit) {
                    this.curval = this.minuilimit;
                }
                break;
            case 'ArrowRight':
                this.curval = this.curval + this.step
                if (this.curval > this.limits.highno) {
                    this.curval = this.limits.highno;
                }
                if (this.curval > this.maxuilimit) {
                    this.curval = this.maxuilimit;
                }
                break;
            case ' ':
                this.curval = this.limits.nominal;
                break;
            case 'Tab':
                // TODO : cycle through active components (event to app level)
                break;
            default:
                break;
        }
        this.cur = this.display(this.curval);
    }

    private onChange: (val: number) => void = () => undefined;
    private onTouched: () => void = () => undefined;
}
