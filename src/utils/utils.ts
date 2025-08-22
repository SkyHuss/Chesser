import type { Color, Piece, PieceType } from "../types/piece";

const files = 'abcdefgh';

export const indexToCoord = (index: number) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const file = files[col];
    const rank = 8 - row;
    const coord = `${file}${rank}`;
    const isDarkSquare = (row + col) % 2 === 1;

    return { index, row, col, file, rank, coord, isDarkSquare};
}

export const fenToBoard = (fen: string): (Piece|null)[] => {
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

export const pieceFromFENChar = (ch: string): Piece | null => {
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
