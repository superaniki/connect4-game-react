
import Board from "./Board";
import { useEffect, useState } from "react";
import { PL1, PL2, EMPTY } from '../constants';

// TODO :
// * show multiple win-lines. only the first detected show right now.
// * Better resizing and aspect-ratio for different sizes.

function createBoardArray(width, height) {
    let boardArray = [];

    for (let y = 0; y < height; y++) {
        let xArray = []
        for (let x = 0; x < width; x++) {
            xArray.push({
                cell: EMPTY,
                position: { x: x, y: y },
                winMark: false
            })
        }
        boardArray.push(xArray);
    }
    return boardArray;
}

function testForWin(board) {
    const Counter = { cell: EMPTY, counter: 0, win: false, pos: [] };
    const height = board.length;
    const width = board[0].length;

    function cellTest(test, elem, pos) {
        if (elem.cell === test.cell && elem.cell != EMPTY) {
            test.matches++;
            console.log(test)
            test.pos.push(pos);
        } else {
            test.cell = elem.cell; //player change, reset count
            test.matches = 1;
            test.pos = [pos];
        }
        if (test.matches == 4 && test.cell != EMPTY) {
            test.win = true;
        }
        return test;
    }

    // vertical lines
    for (let x = 0; x < width; x++) {
        let counter = { ...Counter }
        for (let y = 0; y < height; y++) {
            counter = cellTest(counter, board[y][x], { x: x, y: y });
            if (counter.win)
                return counter;
        }
    }

    // horisontal lines
    for (let y = 0; y < height; y++) {
        let counter = { ...Counter }
        for (let x = 0; x < width; x++) {
            counter = cellTest(counter, board[y][x], { x: x, y: y });
            if (counter.win)
                return counter;
        }
    }

    // Diagonal lines, top horisontal start, travel south east 
    for (let x = 0; x < width; x++) {
        let counter = { ...Counter }
        let y = 0;
        for (let xD = x; y < height && xD < width; xD++) {
            counter = cellTest(counter, board[y][xD], { x: xD, y: y });
            if (counter.win)
                return counter;
            y++;
        }
    }

    // Diagonal lines, top vertical start, travel south east 
    for (let y = 0; y < height; y++) {
        let counter = { ...Counter }
        let x = 0;
        for (let yD = y; x < width && yD < height; yD++) {
            counter = cellTest(counter, board[yD][x], { x: x, y: yD });
            if (counter.win)
                return counter;
            x++;
        }
    }

    // Diagonal lines, top horisontal start, travel south west 
    for (let x = 0; x < width; x++) {
        let counter = { ...Counter }
        let y = 0;
        for (let xD = x; y < height && xD >= 0; xD--) {
            counter = cellTest(counter, board[y][xD], { x: xD, y: y });
            if (counter.win)
                return counter;
            y++;
        }
    }

    // Diagonal lines, top vertical start, travel south west 
    for (let y = 0; y < height; y++) {
        let counter = { ...Counter }
        let x = width - 1;
        for (let yD = y; yD < height && x >= 0; yD++) {
            counter = cellTest(counter, board[yD][x], { x: x, y: yD });
            if (counter.win)
                return counter;
            x--;
        }
    }

    return false;
}

function Connect4({ width, height }) {
    const boardArray = createBoardArray(width, height);
    const [boardArrayState, setBoardArrayState] = useState(boardArray);
    const [boardArrayStateHistory, setBoardArrayStateHistory] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(PL1);
    const [winner, setWinner] = useState(EMPTY)

    const togglePlayer = () => {
        setCurrentPlayer((current) => current === PL1 ? PL2 : PL1);
    }
    
    // After browser reload, get data from local storage
    useEffect(() => {
        const _board = JSON.parse(localStorage.getItem("board"));
        const _player = JSON.parse(localStorage.getItem("player"));
        const _winner = JSON.parse(localStorage.getItem("winner"));
        localStorage.clear();

        // load to state if browser has data
        if (_board) {
            setBoardArrayStateHistory([]);
            setBoardArrayState(_board);
            setCurrentPlayer(_player);
            setWinner(_winner);
        }
        
        // Escape feature for restarting game
        document.addEventListener('keydown', e => e.key == "Escape" ? restartGame() : {}, true);
    }, []);

    // After each turn => save to local storage.
    useEffect(() => {
        localStorage.setItem("board", JSON.stringify(boardArrayState));
        localStorage.setItem("player", JSON.stringify(currentPlayer));
        localStorage.setItem("winner", JSON.stringify(winner));
    }, [boardArrayState]);

    const handleClickOnBoard = (elem) => {
        setCellAndTest(elem, currentPlayer);
    }

    // Set markers for displaying the winning line
    function setWinMarker(board, posArray) {
        posArray.forEach(element => {
            board[element.y][element.x].winMark = true;
        });
    }

    // Make a complete copy for state to regognize change properly
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

    // Most game logic: Set player => test for win => toggle player => display winning line
    function setCellAndTest(data, player) {
        if (winner != EMPTY)
            return;

        for (let y = height - 1; y >= 0; y--) { // from top and test down in Y direction for free cell space
            if (boardArrayState[y][data.position.x].cell === EMPTY) {
                setBoardArrayStateHistory(current => [...current, makeBoardCopy(boardArrayState)]);
                let boardCopy = makeBoardCopy(boardArrayState);
                boardCopy[y][data.position.x].cell = player; // set cell with 
                togglePlayer();

                // test if a line is complete by either player
                const winData = testForWin(boardCopy);

                if (winData != false) {
                    setWinner(winData.cell);
                    setWinMarker(boardCopy, winData.pos);
                    localStorage.clear();
                }

                //update the board finally
                setBoardArrayState(boardCopy);
                break;
            }
        }
    }

    const goBackInHistory = () => {
        if (boardArrayStateHistory.length < 1)
            return;
        togglePlayer();
        setBoardArrayState(boardArrayStateHistory[boardArrayStateHistory.length - 1]);
        setBoardArrayStateHistory(boardArrayStateHistory.slice(0, boardArrayStateHistory.length - 1));
    }

    const restartGame = () => {
        const newBoard = createBoardArray(width, height);
        setBoardArrayState(newBoard);
        setBoardArrayStateHistory([]);
        setWinner(EMPTY);
        setCurrentPlayer(PL1);
        localStorage.clear();
    }

    const hasHistory = () => boardArrayStateHistory.length > 0 ? true : false;

    return <Board setBoard={setBoardArrayState} hasHistory={hasHistory()}
        width={width} height={height} board={boardArrayState} winner={winner} restartGame={restartGame}
        goBackInHistory={goBackInHistory} currentPlayer={currentPlayer} handleClickOnBoard={handleClickOnBoard} />
};

export default Connect4;

//todo. spelreset => hasHistory