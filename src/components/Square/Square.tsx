import './Square.css'
import { useChessStore } from '../../hooks/useChessStore'
import { isSquareAttacked } from '../../utils/moves'

type SquareProps = {
    index: number;
    coord: string;
    isDarkSquare: boolean;
}

export default function Square({ index, coord, isDarkSquare }: SquareProps) {
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
    const selectedPiece = selectedSquare != null ? board?.[selectedSquare] ?? null : null;
    const targetPiece = board?.[index] ?? null;
    const isCaptureTarget = isMoveTarget && selectedPiece !== null && targetPiece !== null && selectedPiece.color !== targetPiece.color;

    // indicate if the king on this square is currently in check
    const isKingInCheck = piece && piece.type === 'king' ? isSquareAttacked(board ?? [], index, piece.color === 'white' ? 'black' : 'white') : false;

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
    isCaptureTarget ? 'capture-target' : (isMoveTarget ? 'move-target' : ''),
    isKingInCheck ? 'in-check' : ''
    ].join(' ').trim();

    return (
        <div className={classes} onClick={onClick} data-coord={coord} role="button" aria-label={coord}>
            {piece ? <span className={`piece ${piece.color}-${piece.type}`}><img src={pieceImg} alt={pieceGlyph} /></span> : null}
            {/* <span className="coord">{coord}</span> */}
        </div>
    )
}