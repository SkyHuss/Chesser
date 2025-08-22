import type { Piece } from "../types/piece";

export const handlePawnMoves = (piece: Piece, index: number, row: number, col: number, board: (Piece| null )[], moves: number[]) => {
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
    return moves;
}

export const handleRockMoves = (index: number, piece: Piece, board: (Piece| null )[], moves: number[]) => {
    // four directions: -8, +8, -1, +1 (stop on block)
    const directions = [-8, 8, -1, 1];
    for (const d of directions) {
        let i = index + d;
        while (inBounds(i)) {
            // prevent wrap for horizontal moves
            if ((d === -1 || d === 1) && getRow(i) !== getRow(i - d)) break;
            if (!pushIfEnemyOrEmpty(i, piece, board, moves)) break;
            i += d;
        }
    } 
    return moves;
}

export const handleBishopMoves = (index: number, piece: Piece, board: (Piece| null )[], moves: number[]) => {
    // four diagonal directions: -9, -7, 7, 9
    const directions = [-9, -7, 7, 9];
    for (const d of directions) {
        let i = index + d;
        while (inBounds(i)) {
            // prevent wrap-around: each diagonal step must move exactly one column
            if (Math.abs(getCol(i) - getCol(i - d)) !== 1) break;
            if (!pushIfEnemyOrEmpty(i, piece, board, moves)) break;
            i += d;
        }
    }
    return moves;
}

export const handleKnightMoves = (index: number, piece: Piece, board: (Piece| null )[], moves: number[]) => {
    // Knight moves: L-shaped (2,1) in all 8 directions
    const row = getRow(index);
    const col = getCol(index);
    const deltas = [-17, -15, -10, -6, 6, 10, 15, 17];
    for (const d of deltas) {
        const t = index + d;
        if (!inBounds(t)) continue;
        const tr = getRow(t);
        const tc = getCol(t);
        const rowDiff = Math.abs(tr - row);
        const colDiff = Math.abs(tc - col);
        // valid L-shape
        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) continue;
        const target = board[t];
        if (target === null || target.color !== piece.color) moves.push(t);
    }
    return moves;
}

export const handleQueenMoves = (index: number, piece: Piece, board: (Piece| null )[], moves: number[]) => {
    // eight directions: combination of rook and bishop
    const directions = [-9, -8, -7, -1, 1, 7, 8, 9];
    for (const d of directions) {
        let i = index + d;
        while (inBounds(i)) {
            // prevent wrap for horizontal moves
            if ((d === -1 || d === 1) && getRow(i) !== getRow(i - d)) break;
            // prevent wrap for diagonal moves: ensure column changes by 1 each step
            if ((d === -9 || d === -7 || d === 7 || d === 9) && Math.abs(getCol(i) - getCol(i - d)) !== 1) break;
            if (!pushIfEnemyOrEmpty(i, piece, board, moves)) break;
            i += d;
        }
    }
    return moves;
}

export const handleKingMoves = (index: number, piece: Piece, board: (Piece| null )[], moves: number[]) => {
    // king moves: one step in any of the 8 directions
    const directions = [-9, -8, -7, -1, 1, 7, 8, 9];
    for (const d of directions) {
        const t = index + d;
        if (!inBounds(t)) continue;
        // prevent wrap for horizontal moves
        if ((d === -1 || d === 1) && getRow(t) !== getRow(t - d)) continue;
        // prevent wrap for diagonal moves: each diagonal step must change column by 1
        if ((d === -9 || d === -7 || d === 7 || d === 9) && Math.abs(getCol(t) - getCol(t - d)) !== 1) continue;
        // use helper to push if empty or enemy (it will not push own-color)
        pushIfEnemyOrEmpty(t, piece, board, moves);
    }
    return moves;
}

export const inBounds = (i: number) => {
    return i >= 0 && i < 64;
}

export const getRow = (index: number) => {
    return Math.floor(index / 8);
}

export const getCol = (index: number) => {
    return index % 8
};

export const pushIfEnemyOrEmpty = (i: number,piece: Piece, board: (Piece| null )[], moves: number[]) => {
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
