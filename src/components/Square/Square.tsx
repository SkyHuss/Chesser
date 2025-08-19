import './Square.css'

type SquareProps = {
    index: number;
    coord: string;
    file: string;
    rank: number;
    isDarkSquare: boolean;
}

export default function Square({ index, coord, file, rank, isDarkSquare }: SquareProps) {

    // TODO:
    // Dans Square.tsx, récupérez props (index, coord, file, rank, isDark) pour afficher, gérer clics et calcul de déplacement.
    // Pour les mouvements, convertissez index -> row/col, appliquez vecteurs (p. ex. déplacement vertical = ±8, horizontal = ±1 en prenant garde aux bords).
    // L'ordre proposé facilite calculs par index (ex : up = index - 8, down = index + 8, left = index - 1 si même row, etc.).

    return <div className={`square ${isDarkSquare ? 'dark' : 'light'}`}>{coord}</div>
}