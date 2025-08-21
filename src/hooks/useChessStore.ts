import { create } from "zustand";
import type { Color, Piece, PieceType } from "../types/piece";

// audio for moves
import moveSoundSrc from '../assets/chess-move.mp3';

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


const initialEmptyBoard = (): (Piece | null)[] => Array.from({ length: 64 }, () => null);

const pieceFromFENChar = (ch: string): Piece | null => {
    const map: Record<string, PieceType> = {
        p:'pawn', r:'rock', n:'knight', b:'bishop', q:'queen', k:'king',
        P:'pawn', R:'rock', N:'knight', B:'bishop', Q:'queen', K:'king'
    };
    if (ch === undefined) return null;
    // const lower = ch;
    if (/[prnbqkPRNBQK]/.test(ch)) {
        const type = map[ch];
        const color: Color = ch === ch.toUpperCase() ? 'white' : 'black';
        // optional symbol (could be improved with svg/emoji)
        // const symbol = ch === ch.toUpperCase() ? ch : ch.toLowerCase();
        return { type, color };
    }
    return null;
};


const fenToBoard = (fen: string): (Piece|null)[] => {
    const rows = fen.split(' ')[0].split('/');
    const board: (Piece|null)[] = [];
    for (const row of rows) {
        for (const ch of row) {
            if (/\d/.test(ch)) {
                const n = parseInt(ch,10);
                for (let i=0;i<n;i++) board.push(null);
            } else {
                board.push(pieceFromFENChar(ch));
            }
        }
    }
    // ensure length 64
    while (board.length < 64) board.push(null);
    return board;
};

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

const getRow = (index: number) => Math.floor(index / 8);
const getCol = (index: number) => index % 8;
const inBounds = (i: number) => i >= 0 && i < 64;

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

    //TODO: check
    resetBoard: () => {
        set({ board: fenToBoard(STARTING_FEN), selectedSquare: null, currentTurn: 'white' });
    },

    //TODO: check
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
            // play returns a promise; ignore it but avoid uncaught
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
        const moves: number[] = [];
        const row = getRow(index);
        const col = getCol(index);

        const pushIfEnemyOrEmpty = (i: number) => {
            if (!inBounds(i)) return false;
            const target = board[i];
            if (target === null) {
                moves.push(i);
                return true; // can continue for sliding pieces
            }
            if (target.color !== piece.color) {
                moves.push(i);
            }
            return false; // blocked
        };

        switch (piece.type) {
            case 'pawn': {
                const dir = piece.color === 'white' ? -8 : 8;
                const startRow = piece.color === 'white' ? 6 : 1;
                const oneForward = index + dir;
                if (inBounds(oneForward) && board[oneForward] === null) {
                    moves.push(oneForward);
                    const twoForward = index + dir*2;
                    if (row === startRow && inBounds(twoForward) && board[twoForward] === null) {
                        moves.push(twoForward);
                    }
                }
                // captures
                const diagLeft = index + dir - 1;
                const diagRight = index + dir + 1;
                if (col > 0 && inBounds(diagLeft) && board[diagLeft] && board[diagLeft]!.color !== piece.color) moves.push(diagLeft);
                if (col < 7 && inBounds(diagRight) && board[diagRight] && board[diagRight]!.color !== piece.color) moves.push(diagRight);
                break;
            }
            case 'rock': {
                // four directions: -8, +8, -1, +1 (stop on block)
                const directions = [-8, 8, -1, 1];
                for (const d of directions) {
                    let i = index + d;
                    while (inBounds(i)) {
                        // prevent wrap for horizontal moves
                        if ((d === -1 || d === 1) && getRow(i) !== getRow(i - d)) break;
                        if (!pushIfEnemyOrEmpty(i)) break;
                        i += d;
                    }
                }
                break;
            }

            // TODO: implement other piece types (n, b, q, k)
            default:
                //Todo: launch piece sound in assets
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