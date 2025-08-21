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