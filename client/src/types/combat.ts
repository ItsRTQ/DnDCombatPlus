export type EntityType = "player" | "enemy";

export interface Status {
  name: string;
  duration: number;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  maxHealth: number;
  health: number;
  tempHP: number;
  statuses: Status[];
}

export interface Room {
  roomKey: string;
  entities: Record<string, Entity>;
  currentTurn: string;
  hidePlayerHP: boolean;
  hideEnemyHP: boolean;
  simpleView: boolean;
}
