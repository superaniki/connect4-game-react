
import { EMPTY, PL1, PL2 } from "../constants";
import { initialState } from "../constants";
import { createBoardArray } from "./boardUtils";

function testForWin(board) {
    const Counter = { cell: EMPTY, matches: 0, win: false, pos: [], stopCollect : false};
    const height = board.length;
    const width = board[0].length;
    const winningLines = [];

    function cellTest(test, elem, pos) {
        if (elem.cell === test.cell && elem.cell != EMPTY && !test.stopCollect) {
            test.matches++;
            test.pos.push(pos);
        } else {
            if (!test.win) {
                test.cell = elem.cell; //player change, reset count
                test.matches = 1;
                test.pos = [pos];
            }else{
                test.stopCollect = true;
            }
        }
        if (test.matches >= 4 && test.cell != EMPTY) {
            test.win = true;
        }
        return test;
    }

    // vertical lines
    for (let x = 0; x < width; x++) {
        let counter = { ...Counter }
        for (let y = 0; y < height; y++) {
            counter = cellTest(counter, board[y][x], { x: x, y: y });
        }
        if (counter.win) {
            winningLines.push(counter);
            break;
        }
    }

    // horisontal lines
    for (let y = 0; y < height; y++) {
        let counter = { ...Counter }
        for (let x = 0; x < width; x++) {
            counter = cellTest(counter, board[y][x], { x: x, y: y });
        }
        if (counter.win) {
            winningLines.push(counter);
            break;
        }
    }

    // Diagonal lines, top horisontal start, travel south east 
    for (let x = 0; x < width; x++) {
        let counter = { ...Counter }
        let y = 0;
        for (let xD = x; y < height && xD < width; xD++) {
            counter = cellTest(counter, board[y][xD], { x: xD, y: y });
            y++;
        }
        if (counter.win) {
            winningLines.push(counter);
            break;
        }
    }

    // Diagonal lines, top vertical start, travel south east 
    for (let y = 0; y < height; y++) {
        let counter = { ...Counter }
        let x = 0;
        for (let yD = y; x < width && yD < height; yD++) {
            counter = cellTest(counter, board[yD][x], { x: x, y: yD });
            x++;
        }
        if (counter.win) {
            winningLines.push(counter);
            break;
        }
    }

    // Diagonal lines, top horisontal start, travel south west 
    for (let x = 0; x < width; x++) {
        let counter = { ...Counter }
        let y = 0;
        for (let xD = x; y < height && xD >= 0; xD--) {
            counter = cellTest(counter, board[y][xD], { x: xD, y: y });
            y++;
        } if (counter.win) {
            winningLines.push(counter);
            break;
        }
    }

    // Diagonal lines, top vertical start, travel south west 
    for (let y = 0; y < height; y++) {
        let counter = { ...Counter }
        let x = width - 1;
        for (let yD = y; yD < height && x >= 0; yD++) {
            counter = cellTest(counter, board[yD][x], { x: x, y: yD });
            x--;
        }
        if (counter.win) {
            winningLines.push(counter);
            break;
        }
    }

    return (winningLines.length > 0) ? winningLines : false;
}

function findEmptyCellFromTop(x, board) {
    for (let y = board.length - 1; y >= 0; y--) { // from top and test down in Y direction for free cell space
        if (board[y][x].cell === EMPTY) {
            return y;
        }
    }

    return false;
}

// Set markers for displaying the winning line
function setWinMarker(board, winLines) {
    window.line = winLines;
    winLines.forEach(winLine => {
        winLine.pos.forEach(pos => {
            board[pos.y][pos.x].winMark = true;
        });
    });

}

// Make a complete copy for state to recognize change properly
function makeBoardCopy(array) {
    let newArray = [];
    array.forEach(element => {
        let newArray2 = [];
        element.forEach(elem => {
            newArray2.push({ ...elem })
        })
        newArray.push(newArray2);
    });
    return newArray;
}

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'setMarker': {
            if (state.winner != EMPTY)
                return { ...state }

            const yPos = findEmptyCellFromTop(action.payload.x, state.boardArray);

            if (yPos === false)
                return { ...state }

            let lastBoard = makeBoardCopy(state.boardArray);
            let boardCopy = makeBoardCopy(state.boardArray);
            boardCopy[yPos][action.payload.x].cell = state.currentPlayer; // set cell with 

            // test if a line is complete by either player
            const winLines = testForWin(boardCopy);
            window.winLines = winLines;

            if (winLines != false) {
                setWinMarker(boardCopy, winLines);
                localStorage.clear();
            }

            return {
                ...state, boardArray: boardCopy,
                currentPlayer: state.currentPlayer === PL1 ? PL2 : PL1,
                winner: winLines != false ? winLines[0].cell : EMPTY,
                boardArrayHistory: [...state.boardArrayHistory, lastBoard]
            };
        }
        case 'goBackInHistory': {
            if (state.boardArrayHistory.length < 1)
                return { ...state }

            return {
                ...state, boardArray: state.boardArrayHistory[state.boardArrayHistory.length - 1],
                currentPlayer: state.currentPlayer === PL1 ? PL2 : PL1,
                boardArrayHistory: state.boardArrayHistory.slice(0, state.boardArrayHistory.length - 1)
            };
        }
        case 'restartGame': {
            const newBoard = createBoardArray(action.payload.width, action.payload.height);
            localStorage.clear();
            return {
                ...initialState, boardArray: newBoard,
            };
        }
        case 'setStates': {
            return {
                ...initialState, ...action.payload
            };
        }

        default:
            break;
    }
}

export default gameReducer;