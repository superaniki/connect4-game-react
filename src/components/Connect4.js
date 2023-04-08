
import Board from "./Board";
import { useEffect, useReducer } from "react";
import { initialState } from '../constants';
import gameReducer from "./gameReducer";
import { createBoardArray } from "./boardUtils";

// TODO :
// * Better resizing and aspect-ratio for different sizes.

function Connect4({ width, height }) {
    const [state, dispatch] = useReducer(gameReducer, { ...initialState, 
        boardArray: createBoardArray(width, height) });
    const {winner, currentPlayer, boardArray, boardArrayHistory} = state;

    // After browser reload, get data from local storage
    useEffect(() => {
        const _board = JSON.parse(localStorage.getItem("board"));
        const _player = JSON.parse(localStorage.getItem("player"));
        const _winner = JSON.parse(localStorage.getItem("winner"));
        localStorage.clear();

        if (_board) {
            dispatch({
                type: "setStates", payload: {
                    boardArray: _board,
                    boardArrayHistory: [],
                    currentPlayer: _player,
                    winner: _winner
                }
            });
        }
        // Escape feature for restarting game
        document.addEventListener('keydown', e => e.key == "Escape" ? restartGame() : {}, true);
    }, []);

    // After each turn => save to local storage.
    useEffect(() => {
        console.log("savestate")
        localStorage.setItem("board", JSON.stringify(boardArray));
        localStorage.setItem("player", JSON.stringify(currentPlayer));
        localStorage.setItem("winner", JSON.stringify(winner));
    }, [boardArray]);

    const handleClickOnBoard = (elem) => {
        dispatch({ type: "setMarker", payload: elem.position });
    }

    const goBackInHistory = () => {
        dispatch({ type: "goBackInHistory" });
    }

    const restartGame = () => {
        dispatch({ type: "restartGame", payload: { width: width, height: height } });
    }

    const hasHistory = () => boardArrayHistory.length > 0 ? true : false;

    return <Board hasHistory={hasHistory()}
        width={width} height={height} board={boardArray} winner={winner} restartGame={restartGame}
        goBackInHistory={goBackInHistory} currentPlayer={currentPlayer} handleClickOnBoard={handleClickOnBoard} />
};

export default Connect4;