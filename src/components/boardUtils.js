import { EMPTY } from '../constants';
import { cellTemplate } from '../constants';

export const createBoardArray = (width, height) =>{
    let boardArray = [];

    for (let y = 0; y < height; y++) {
        let xArray = []
        for (let x = 0; x < width; x++) {
            xArray.push({ ...cellTemplate, position: { x: x, y: y } })
        }
        boardArray.push(xArray);
    }
    return boardArray;
}