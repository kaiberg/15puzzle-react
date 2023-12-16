import React, {useEffect, useState} from "react";
import {range} from "lodash";
import useTimer from "../hooks/useTimer";
import {produce} from "immer";

enum directions {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

type piece = {
    value: number | null,
    isCorrect: boolean,
    isEmpty: boolean,
}

const directionsXY = new Map<directions, { rowShift: number, columnShift: number }>([
    [directions.UP, { rowShift: 1, columnShift: 0 }],
    [directions.DOWN, { rowShift: -1, columnShift: 0 }],
    [directions.LEFT, { rowShift: 0, columnShift: 1 }],
    [directions.RIGHT, { rowShift: 0, columnShift: -1 }],
]);

function move(direction: directions, board: piece[][], pieceXY: { row: number, column: number })
    : { board: piece[][], pieceXY: { row: number, column: number } } {
    const translation = directionsXY.get(direction);
    if (translation === undefined) {
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

    let newBoard = produce(board, draft => {
        const buffer = draft[translatedXY.row][translatedXY.column];
        draft[translatedXY.row][translatedXY.column] = draft[pieceXY.row][pieceXY.column];
        draft[pieceXY.row][pieceXY.column] = buffer;
        validatePosition(translatedXY.row, translatedXY.column, columnCount, draft[translatedXY.row][translatedXY.column]);
        validatePosition(pieceXY.row, pieceXY.column, columnCount, draft[pieceXY.row][pieceXY.column]);
        return draft;
    })

    return {board: newBoard, pieceXY: translatedXY}
}

function validatePosition(row: number, column: number, columnCount: number, piece: piece): piece {
    const val = row * columnCount + column + 1
    piece.isCorrect = (piece.value === val);
    return piece;
}

const gameBoard: piece[][] = range(0,4).map((rowOffset) =>
    range(1,5).map((columnOffset) : piece => ({
        isCorrect: true,
        value: rowOffset*4+columnOffset,
        isEmpty: rowOffset*4+columnOffset === 16,
    }))
);

const INITIAL_STATE: game = {
    board: gameBoard,
    isOver: false,
    moves: 0,
    emptyIndex: { row: gameBoard.length-1, column: gameBoard[0].length-1 }
}

const gameJSON = JSON.stringify(INITIAL_STATE);

type game = {
    board: piece[][],
    isOver: boolean,
    moves: number,
    emptyIndex: { row: number, column: number }
}

function Piece({ isEmpty, ...props }: piece) {
    if(isEmpty)
        return (
            <div className='piece' />
        )

    return(
        <div className={`piece ${props.isCorrect ? 'correct' : 'incorrect'} helvetica`}>{props.value}</div>
        )
}


function Game() {
    const [gameState, setGameState] = useState(INITIAL_STATE);
    const {time, paused, setPaused} = useTimer()

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
        reset();
    },[]);

    useEffect(() => {
        const handleKeyPress = (event : KeyboardEvent) => {
            console.log(event.key)
            if(["w","ArrowUp","a","ArrowLeft","s","ArrowDown","d","ArrowRight"].includes(event.key))
                event.preventDefault();
            switch (event.key) {
                case "Space":
                case "p":
                    break;
                case "r":
                    reset()
                    break;
                case "w":
                case "ArrowUp":
                    handleMovement(directions.UP);
                    break;
                case "a":
                case "ArrowLeft":
                    handleMovement(directions.LEFT);
                    break;
                case "s": // S key
                case "ArrowDown": // DOWN
                    handleMovement(directions.DOWN);
                    break;
                case "d":
                case "ArrowRight":
                    handleMovement(directions.RIGHT);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div className="main">
            <div className="flex row between">
                <button className="secondary-b weight six00 helvetica">
                    <div className="secondary-b-wrapper" onClick={reset}>new game</div>
                </button>
                <div className="secondary-b white flex row width fitc gap tworem">
                    <div className="width fitc">{/* :D HEHE*/}</div>
                    <div className="flex column margin0 width five0">
                        <p className="margin0 text end font small helvetica">MOVES</p>
                        <p className="margin0 text end font medium weight bold helvetica">{gameState.moves}</p>
                    </div>
                    <div className="flex column margin0 width five0">
                        <p className="margin0 text end font small helvetica">TIME</p>
                        <p className="margin0 text end font medium weight bold helvetica">{time}s</p>
                    </div>
                </div>
            </div>
            <div className="game row">
                {
                    gameState.board.map((row, index) => (
                        // rows dont get reordered
                        <PieceRow pieces={row} key={index} />
                    ))
                }
            </div>

            <button className="secondary-b full weight six00 helvetica">
                <div className="secondary-b-wrapper" onClick={() => setPaused(!paused)}>Pause</div>
            </button>
        </div>)
}

function PieceRow({ pieces }: { pieces: piece[] }) {
    return (
        <div className='game row flex row between'>
            {pieces.map((pieceInfo) => {
                return (
                    <Piece {...pieceInfo} key={pieceInfo.value} />
                )
            })}
        </div>);
}

export default Game