import { create } from "zustand";
import type { Color, Piece } from "../types/piece";

// audio for moves
import moveSoundSrc from '../assets/chess-move.mp3';
import { fenToBoard } from "../utils/utils";
import { getCol, getRow, handleBishopMoves, handleKingMoves, handleKnightMoves, handlePawnMoves, handleQueenMoves, handleRockMoves, inBounds, filterLegalMoves, isSquareAttacked } from "../utils/moves";

// cached audio element (module-scoped to avoid attaching to hook)
let moveAudio: HTMLAudioElement | null = null;

interface ChessStore {
    isGameStarted: boolean;
    board: (Piece | null)[];
    selectedSquare: number | null;
    currentTurn: Color;
    isGameOver?: boolean;
    winner?: Color | null;
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
    isGameOver: false,
    winner: null,
    board: initialEmptyBoard(),
    selectedSquare: null,
    currentTurn: "white" as Color,
    startGame: () => {
        set({
            isGameStarted: true,
            isGameOver: false,
            winner: null,
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

        // after the move, check for checkmate against the player to move (nextTurn)
        try {
            const state = get();
            const boardAfter = state.board;
            const opponent: Color = nextTurn;
            // find opponent king
            const kingIndex = boardAfter.findIndex(p => p && p.type === 'king' && p.color === opponent);
            if (kingIndex !== -1) {
                const inCheck = isSquareAttacked(boardAfter, kingIndex, opponent === 'white' ? 'black' : 'white');
                if (inCheck) {
                    // check if opponent has any legal move
                    let hasAny = false;
                    for (let i = 0; i < 64; i++) {
                        const p = boardAfter[i];
                        if (!p || p.color !== opponent) continue;
                        const moves = state.legalMovesFrom(i);
                        if (moves.length > 0) { hasAny = true; break; }
                    }
                    if (!hasAny) {
                        // checkmate: current mover (piece.color) wins
                        set({ isGameOver: true, winner: piece.color });
                    }
                }
            }
        } catch {
            // defensive: don't break game if checkmate detection errors
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
    const unique = Array.from(new Set(moves)).filter(inBounds);
    // filter moves that would leave king in check
    return filterLegalMoves(board, index, unique);
    }

}))

export const globalStartGame = () => {
    useChessStore.getState().startGame();
}

export const globalStopGame = () => {
    useChessStore.getState().stopGame();
}