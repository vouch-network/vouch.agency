export const VouchType = {
  Unvouched: 0,
  Vouched: 1,
};

export enum VouchTypeEnum {
  Unvouched = 0,
  Vouched = 1,
}

export interface Vouch {
  vouchType: VouchTypeEnum;
  timestamp: number;
  username?: string;
}
