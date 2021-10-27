export const VouchType = {
  Unvouched: 0,
  Vouched: 1,
};

enum VouchTypeEnum {
  Unvouched = 0,
  Vouched = 1,
}

export interface Vouch {
  byUsername: string;
  vouchType: VouchTypeEnum;
  timestamp: number;
}
