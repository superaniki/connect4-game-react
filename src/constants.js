
export const PL1 = "PL1";
export const PL2 = "PL2";
export const EMPTY = "EMPTY";

export const initialState = {
    boardArray: [],
    boardArrayHistory: [],
    currentPlayer: PL1,
    winner: EMPTY
}

export const cellTemplate = {
    cell: EMPTY,
    position: { x: 0, y: 0 },
    winMark: false
}