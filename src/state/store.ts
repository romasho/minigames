export interface AppState {
  activeGame: string | null;
}

export const store: Readonly<AppState> = {
  activeGame: null,
};
