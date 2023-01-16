import { Command } from '../data-types/command';
import { ckick } from './ckick';
import { cmove } from './cmove';
import { fkick } from './fkick';
import { fmove } from './fmove';
import { rmove } from './rmove';
import { tmove } from './tmove';
import { ucount } from './ucount';
import { ymove } from './ymove';
import { zkick } from './zkick';
import { zmove } from './zmove';

export const moveerCommands: Array<Command> = [
  fmove,
  ckick,
  cmove,
  fkick,
  rmove,
  tmove,
  ucount,
  ymove,
  zkick,
  zmove,
];
