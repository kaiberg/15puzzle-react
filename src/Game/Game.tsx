import React, {useEffect, useState} from "react";
import {v4 as uuidv4} from "uuid";

enum directions {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

const directionsXY = new Map<directions, { rowShift: number, columnShift: number }>([
    [directions.UP, { rowShift: 1, columnShift: 0 }],
    [directions.DOWN, { rowShift: -1, columnShift: 0 }],
    [directions.LEFT, { rowShift: 0, columnShift: 1 }],
    [directions.RIGHT, { rowShift: 0, columnShift: -1 }],
]);


const pieceV: piece = {
    value: 1,
    isCorrect: false,
    isEmpty: false
}

function move(direction: directions, board: piece[][], pieceXY: { row: number, column: number })
    : { board: piece[][], pieceXY: { row: number, column: number } } {
    const translation = directionsXY.get(direction);

    if (translation?.rowShift === undefined || translation?.columnShift === undefined) {
        console.log('translation not set');
        return { board, pieceXY };
    }

    const columnCount = board[0].length;
    const translatedXY = {
        row: pieceXY.row + translation.rowShift,
        column: pieceXY.column + translation.columnShift
    }

    if (translatedXY.row < 0 ||
        translatedXY.row >= board.length ||
        translatedXY.column < 0 ||
        translatedXY.column >= columnCount) {
        console.log('translation out of bounds');
        return { board, pieceXY };
    }

    let b = [...board];
    const buffer = b[translatedXY.row][translatedXY.column];
    b[translatedXY.row][translatedXY.column] = b[pieceXY.row][pieceXY.column];
    b[pieceXY.row][pieceXY.column] = buffer;
    validatePosition(translatedXY.row, translatedXY.column, columnCount, b[translatedXY.row][translatedXY.column]);
    validatePosition(pieceXY.row, pieceXY.column, columnCount, b[pieceXY.row][pieceXY.column]);

    return { board: b, pieceXY:translatedXY };
}

function validatePosition(row: number, column: number, columnCount: number, piece: piece): piece {
    const val = row * columnCount + column + 1
    piece.isCorrect = (piece.value === val);
    return piece;
}

const gameBoard: piece[][] = [
    [
        { ...pieceV, isCorrect: true, value: 1 }, { ...pieceV, isCorrect: true, value: 2 }, { ...pieceV, isCorrect: true, value: 3 }, { ...pieceV, isCorrect: true, value: 4 },
    ],
    [
        { ...pieceV, isCorrect: true, value: 5 }, { ...pieceV, isCorrect: true, value: 6 }, { ...pieceV, isCorrect: true, value: 7 }, { ...pieceV, isCorrect: true, value: 8 },],
    [
        { ...pieceV, isCorrect: true, value: 9 }, { ...pieceV, isCorrect: true, value: 10 }, { ...pieceV, isCorrect: true, value: 11 }, { ...pieceV, isCorrect: true, value: 12 },],
    [
        { ...pieceV, isCorrect: true, value: 13 }, { ...pieceV, isCorrect: true, value: 14 }, { ...pieceV, isCorrect: true, value: 15 }, { ...pieceV, isCorrect: true, value: 16, isEmpty: true },],
]

const gameV: game = {
    board: gameBoard,
    isOver: false,
    moves: 0,
    time: 0,
    emptyIndex: { row: gameBoard.length-1, column: gameBoard[0].length-1 }
}

const gameJSON = JSON.stringify(gameV);

type piece = {
    value: number | null,
    isCorrect: boolean,
    isEmpty: boolean,
}

type game = {
    board: piece[][],
    isOver: boolean,
    moves: number,
    time: number,
    emptyIndex: { row: number, column: number }
}

function Piece({ piece }: { piece: piece }) {

    return (piece.isEmpty) ? (
            <div className='piece' />)
        :
        (<div className={`piece ${piece.isCorrect ? 'correct' : 'incorrect'} helvetica`}>{piece.value}</div>
        )
}


function Game() {
    useEffect(() => {
        reset();
    },[]);
    const [gameState, setGameState] = useState(gameV);

    const reset = () => {
        const g : game = JSON.parse(gameJSON);
        for (let i = 0; i <= 25000; i++) {
            const dirN = Math.random();
            const dir = (dirN >= 0.5) ? (dirN >= 0.75) ? directions.UP : directions.DOWN : (dirN >= 0.25) ? directions.LEFT : directions.RIGHT;

            const m = move(dir, g.board, g.emptyIndex);
            g.board = m.board;
            g.emptyIndex = m.pieceXY;
        }
        setGameState(g);
    };

    const handleMovement = (direction : directions) => {
        setGameState(prevGameState => {
            const change = move(direction, prevGameState.board, prevGameState.emptyIndex);

            if(prevGameState.emptyIndex.column === change.pieceXY.column && prevGameState.emptyIndex.row === change.pieceXY.row) {
                return {...prevGameState};
            }
            return {
                ...prevGameState,
                board: change.board,
                emptyIndex: change.pieceXY,
                moves: prevGameState.moves + 1,
            };

        });
    };

    useEffect(() => {
        const handleKeyPress = (event : any) => {
            switch (event.keyCode) {
                case 87: // W
                case 38: // UP
                    handleMovement(directions.UP);
                    event.preventDefault();
                    break;
                case 65: // A
                case 37: // LEFT
                    handleMovement(directions.LEFT);
                    event.preventDefault();
                    break;
                case 83: // S key
                case 40: // DOWN
                    handleMovement(directions.DOWN);
                    event.preventDefault();
                    break;
                case 68: // D key
                case 39: // RIGHT
                    handleMovement(directions.RIGHT);
                    event.preventDefault();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setGameState(prevGameState => ({
                ...prevGameState,
                time: prevGameState.time + 1
            }));
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="main">
            <div className="flex row between">
                <button className="secondary-b weight six00 helvetica">
                    <div className="secondary-b-wrapper" onClick={reset}>new game</div>
                </button>
                {/* <!-- <div>
            <p className="margin0">moves 0</p>
            <p className="margin0">time 0s</p>
        </div> --> */}
                <div className="secondary-b white flex row width fitc gap tworem">
                    <div className="width fitc">{/* :D HEHE*/}</div>
                    <div className="flex column margin0 width five0">
                        <p className="margin0 text end font small helvetica">MOVES</p>
                        <p className="margin0 text end font medium weight bold helvetica">{gameState.moves}</p>
                    </div>
                    <div className="flex column margin0 width five0">
                        <p className="margin0 text end font small helvetica">TIME</p>
                        <p className="margin0 text end font medium weight bold helvetica">{gameState.time}s</p>
                    </div>
                </div>
            </div>
            <div className="game row">
                {
                    gameState.board.map((row, index) => (
                        <PieceRow pieces={row} key={`row-${uuidv4()}`} />
                    ))
                }
            </div>

            <button className="secondary-b full weight six00 helvetica">
                <div className="secondary-b-wrapper">Pause</div>
            </button>
        </div>)
}

function PieceRow({ pieces }: { pieces: piece[] }) {
    return (
        <div className='game row flex row between'>
            {pieces.map((val, index) => {
                return (
                    <Piece piece={val} key={index} />
                )

            })}
        </div>);
}

export default Game