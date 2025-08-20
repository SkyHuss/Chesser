import './Square.css'
import { useChessStore } from '../../hooks/useChessStore'

type SquareProps = {
    index: number;
    coord: string;
    file: string;
    rank: number;
    isDarkSquare: boolean;
}

export default function Square({ index, coord, file, rank, isDarkSquare }: SquareProps) {
    const {
        board,
        selectedSquare,
        currentTurn,
        selectSquare,
        movePiece,
        legalMovesFrom
    } = useChessStore();

    const piece = board?.[index] ?? null;
    const isSelected = selectedSquare === index;
    const legalMoves = selectedSquare != null ? legalMovesFrom(selectedSquare) : [];
    const isMoveTarget = legalMoves.includes(index);

    const glyphs: Record<string, Record<string, string>> = {
        white: { king: '♔', queen: '♕', rock: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
        black: { king: '♚', queen: '♛', rock: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
    };
    const pieceGlyph = piece ? (glyphs[piece.color]?.[piece.type] ?? '') : '';
    const pieceImg = `assets/pieces/${piece?.color}/${piece?.type}.png`;

    const onClick = () => {
        // deselect if clicking same square
        if (isSelected) { selectSquare(null); return; }

        // if a piece is selected and this is a legal target -> move
        if (selectedSquare != null) {
            if (isMoveTarget) {
                movePiece(selectedSquare, index);
                selectSquare(null);
                return;
            }
            // otherwise try selecting another piece below
        }

        // select only if there's a piece of the current turn
        if (piece && piece.color === currentTurn) {
            selectSquare(index);
        } else {
            selectSquare(null);
        }
    }

    const classes = [
        'square',
        isDarkSquare ? 'dark' : 'light',
        isSelected ? 'selected' : '',
        isMoveTarget ? 'move-target' : ''
    ].join(' ').trim();

    return (
        <div className={classes} onClick={onClick} data-coord={coord} role="button" aria-label={coord}>
            {piece ? <span className={`piece ${piece.color}-${piece.type}`}><img src={pieceImg} alt={pieceGlyph} /></span> : null}
            {/* <span className="coord">{coord}</span> */}
        </div>
    )
}