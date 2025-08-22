import { create } from "zustand";
import type { Color, Piece } from "../types/piece";

// audio for moves
import moveSoundSrc from '../assets/chess-move.mp3';
import { fenToBoard } from "../utils/utils";
import { getCol, getRow, handleBishopMoves, handleKingMoves, handleKnightMoves, handlePawnMoves, handleQueenMoves, handleRockMoves, inBounds } from "../utils/moves";

// cached audio element (module-scoped to avoid attaching to hook)
let moveAudio: HTMLAudioElement | null = null;

interface ChessStore {
    isGameStarted: boolean;
    board: (Piece | null)[];
    selectedSquare: number | null;
    currentTurn: Color;
    startGame: () => void;
    stopGame: () => void;
    selectSquare: (index: number | null) => void;
    movePiece: (from: number, to: number) => void;
    legalMovesFrom: (index: number) => number[];
    resetBoard: () => void;
}


const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

const initialEmptyBoard = (): (Piece | null)[] => Array.from({ length: 64 }, () => null);

export const useChessStore = create<ChessStore>()((set, get) => ({
    isGameStarted: false,
    board: initialEmptyBoard(),
    selectedSquare: null,
    currentTurn: "white" as Color,
    startGame: () => {
        set({
            isGameStarted: true,
            board:fenToBoard(STARTING_FEN),
            selectedSquare: null,
            currentTurn: "white"
        })

        console.log(get().isGameStarted)
        console.log(get().board)
        console.log(get().currentTurn)
    },
    stopGame: () => {
        set({
            isGameStarted: false,
        })
    },

    resetBoard: () => {
        set({ board: fenToBoard(STARTING_FEN), selectedSquare: null, currentTurn: 'white' });
    },

    selectSquare: (index: number | null) => {
        set({ selectedSquare: index });
    },

    //TODO: check
    movePiece: (from: number, to: number) => {
        const { board } = get();
        if (!inBounds(from) || !inBounds(to)) return;
        const piece = board[from];
        if (!piece) return;
        const newBoard = board.slice();
        newBoard[to] = piece;
        newBoard[from] = null;
        const nextTurn: Color = get().currentTurn === 'white' ? 'black' : 'white';
        set({ board: newBoard, selectedSquare: null, currentTurn: nextTurn });

        // play sound: reuse Audio element to avoid reloading
        try {
            if (!moveAudio) moveAudio = new Audio(moveSoundSrc);
            moveAudio.playbackRate = 1.0;
            moveAudio.volume = 0.6;
            
            moveAudio.currentTime = 0.4;
            moveAudio.play().catch(() => { /* ignore autoplay errors */ });
        } catch {
            // ignore audio errors
        }
    },

    //TODO: check
    legalMovesFrom: (index: number) => {
        const { board } = get();
        if (!inBounds(index)) return [];
        const piece = board[index];
        if (!piece) return [];
        let moves: number[] = [];
        const row = getRow(index);
        const col = getCol(index);



        switch (piece.type) {
            case 'pawn': {
                moves = handlePawnMoves(piece,index,row,col,board,moves)
                break;
            }
            case 'rock': {
                moves = handleRockMoves(index, piece,board,moves)
                break;
            } 
            case 'knight': {
                moves = handleKnightMoves(index,piece,board,moves )
                break;
            }
            case 'bishop': {
                moves = handleBishopMoves(index, piece, board,moves)
                break;
            }
            case 'queen': {
                moves = handleQueenMoves(index, piece, board,moves)
                break;
            }
            case 'king': {
                moves = handleKingMoves(index, piece, board,moves)
                break;
            }

            // TODO: implement other piece types (n, b, q, k)
            default:
                break;
        }

        // remove duplicates and ensure in bounds
        return Array.from(new Set(moves)).filter(inBounds);
    }

}))

export const globalStartGame = () => {
    useChessStore.getState().startGame();
}

export const globalStopGame = () => {
    useChessStore.getState().stopGame();
}