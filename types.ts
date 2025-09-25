
export enum CellState {
  Turgid = 'TURGID',
  Flaccid = 'FLACCID',
  Plasmolyzed = 'PLASMOLYZED',
}

export enum Scenario {
  Normal = 'NORMAL',
  Drought = 'DROUGHT',
  Freshwater = 'FRESHWATER',
}

export interface Molecule {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isInside: boolean;
}
