// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const PIECE_TYPES = {
//     PAWN: 'pawn',
//     ROOK: 'rook',
//     KNIGHT: 'knight',
//     BISHOP: 'bishop',
//     QUEEN: 'queen',
//     KING: 'king',
// } as const;

export type PieceType = 'pawn' | 'rock' | 'knight' | 'bishop' | 'queen' | 'king';

export type Piece = { 
    type: PieceType
    color: Color;
}

export type Color = 'black' | 'white';

// export type PieceType = typeof PIECE_TYPES[keyof typeof PIECE_TYPES];