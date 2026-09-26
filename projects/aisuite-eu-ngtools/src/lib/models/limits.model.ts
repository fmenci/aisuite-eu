export class LimitsModel {
    constructor(
        public name: string,
        public lowno: number,
        public lowband: number,
        public nominal: number,
        public highband: number,
        public highno: number,
        public decimalaccuracy: number,
        public storeprecision: number,
        public limitPhysicMessage: string,
        public alertlow?: string,
        public alerthigh?: string,
        public step?: number
    ) { }
}
