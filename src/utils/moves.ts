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

export const handleKingMoves = (index: number, piece: Piece, board: (Piece| null )[], moves: number[], kingMoved = false, rookAMoved = false, rookHMoved = false) => {
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
    // castling: allow if king and rook are on their starting squares, path empty and not under attack
    // determine initial positions based on color
    const isWhite = piece.color === 'white';
    const kingStart = isWhite ? 60 : 4;
    const rookA = isWhite ? 56 : 0; // queenside rook
    const rookH = isWhite ? 63 : 7; // kingside rook
    const opponent = isWhite ? 'black' : 'white';

    // only allow castling if king is on its starting square and hasn't moved
    if (index === kingStart && !kingMoved) {
        // kingside
        const betweenK = [index + 1, index + 2];
        const rookK = board[rookH];
        if (rookK && rookK.color === piece.color && !rookHMoved) {
            // squares between must be empty
            if (betweenK.every(i => inBounds(i) && board[i] === null)) {
                // king not currently in check and squares it moves through not attacked
                const squaresToCheck = [index, index + 1, index + 2];
                const safe = squaresToCheck.every(s => !isSquareAttacked(board, s, opponent));
                if (safe) moves.push(index + 2);
            }
        }

        // queenside
    const betweenQ = [index - 1, index - 2, index - 3];
    const rookQ = board[rookA];
    if (rookQ && rookQ.color === piece.color && !rookAMoved) {
            if (betweenQ.every(i => inBounds(i) && board[i] === null)) {
                const squaresToCheck = [index, index - 1, index - 2];
                const safe = squaresToCheck.every(s => !isSquareAttacked(board, s, opponent));
                if (safe) moves.push(index - 2);
            }
        }
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

// returns true if `square` is attacked by any piece of color `byColor` on given board
export const isSquareAttacked = (board: (Piece|null)[], square: number, byColor: string) => {
    if (!inBounds(square)) return false;
    // pawn attacks
    for (let i = 0; i < 64; i++) {
        const p = board[i];
        if (!p || p.color !== byColor) continue;
        const type = p.type;
        if (type === 'pawn') {
            const dir = p.color === 'white' ? -8 : 8;
            const a1 = i + dir - 1;
            const a2 = i + dir + 1;
            if (a1 === square || a2 === square) return true;
            continue;
        }
        if (type === 'knight') {
            const deltas = [-17, -15, -10, -6, 6, 10, 15, 17];
            for (const d of deltas) {
                const t = i + d;
                if (!inBounds(t)) continue;
                // validate actual L-shape
                const tr = getRow(t);
                const tc = getCol(t);
                const rowDiff = Math.abs(tr - getRow(i));
                const colDiff = Math.abs(tc - getCol(i));
                if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) continue;
                if (t === square) return true;
            }
            continue;
        }
        if (type === 'bishop' || type === 'rock' || type === 'queen') {
            const dirs: number[] = [];
            if (type === 'bishop') dirs.push(-9, -7, 7, 9);
            else if (type === 'rock') dirs.push(-8, -1, 1, 8);
            else dirs.push(-9, -8, -7, -1, 1, 7, 8, 9);

            for (const d of dirs) {
                let t = i + d;
                while (inBounds(t)) {
                    // wrap prevention
                    if ((d === -1 || d === 1) && getRow(t) !== getRow(t - d)) break;
                    if ((d === -9 || d === -7 || d === 7 || d === 9) && Math.abs(getCol(t) - getCol(t - d)) !== 1) break;
                    if (t === square) return true;
                    if (board[t] !== null) break;
                    t += d;
                }
            }
            continue;
        }
        if (type === 'king') {
            const dirs = [-9, -8, -7, -1, 1, 7, 8, 9];
            for (const d of dirs) {
                const t = i + d;
                if (!inBounds(t)) continue;
                if ((d === -1 || d === 1) && getRow(t) !== getRow(i)) continue;
                if ((d === -9 || d === -7 || d === 7 || d === 9) && Math.abs(getCol(t) - getCol(i)) !== 1) continue;
                if (t === square) return true;
            }
            continue;
        }
    }
    return false;
}

// filters out moves that would leave `from` player's king in check
export const filterLegalMoves = (board: (Piece|null)[], from: number, moves: number[]) => {
    const piece = board[from];
    if (!piece) return [];
    const color = piece.color;
    const opponent = color === 'white' ? 'black' : 'white';
    const legal: number[] = [];

    for (const to of moves) {
        const newBoard = board.slice();
        newBoard[to] = piece;
        newBoard[from] = null;

        // find king position for color
        let kingIndex = -1;
        if (piece.type === 'king') {
            kingIndex = to;
        } else {
            for (let i = 0; i < 64; i++) {
                const p = newBoard[i];
                if (p && p.type === 'king' && p.color === color) { kingIndex = i; break; }
            }
        }
        if (kingIndex === -1) continue; // no king? be defensive

        // if king not attacked by opponent after the move, keep it
        if (!isSquareAttacked(newBoard, kingIndex, opponent)) legal.push(to);
    }

    return legal;
}
