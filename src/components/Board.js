import { EMPTY } from '../constants';

// just the DOM with some callbacks
function Board({ width, height, board, winner, restartGame, keyProp, hasHistory, goBackInHistory, currentPlayer, handleClickOnBoard }) {
    let domItems = [];
    let count = 0;
    let textInfo = "";

    // create DOM nodes with board array data
    board.forEach((elementArray) => {
        elementArray.forEach((element) => {
            domItems.push(
                <div onClick={(e) => handleClickOnBoard(element)} key={count++}
                    className={`cell ${element.cell.toLowerCase()}`}>
                    <div className={element.winMark ? `winMark` : ``} />
                </div>)
        });
    });

    if (winner == EMPTY) {
        textInfo = <div className="inline"> Player <div className={`pl${currentPlayer[2]}-color`}> {currentPlayer[2]} </div>turn </div>;
    } else {
        textInfo = <div className="inline"> Winner is player {winner[2]} ! </div>;
    }

    let restartButton = winner != EMPTY ? <button onClick={() => restartGame()} className="playAgainBtn">Play again!</button> : "";
    let goBackButton = hasHistory && winner === EMPTY ? <button onClick={goBackInHistory} className="playAgainBtn">Rewind</button> : "";

    return <div key={keyProp} className="grid">
        <div style={{
            gridTemplateColumns: `repeat(${width},1fr)`,
            gridTemplateRows: `repeat(${height},1fr)`,
            width: `${width * 100}px`,
            height: `${height * 100}px`,
        }}
            className='board m-auto mt-10 bg-slate-200'>
            {domItems}
        </div>;

        <div className="textBelowBoard">{textInfo}</div>

        {restartButton}
        {goBackButton}
    </div>
};

export default Board;