import './PiecesPreview.css';

type PiecesPreviewProps = {
    isWhite: string;
};

export default function PiecesPreview({ isWhite }: PiecesPreviewProps) {

    const pieceColor = isWhite === 'true' ? 'white' : 'black';

    return <div className="pieces-preview-container">
        <img src={`/assets/pieces/${pieceColor}/king.png`} alt="piece" />
        <img src={`/assets/pieces/${pieceColor}/queen.png`} alt="piece" />
        <img src={`/assets/pieces/${pieceColor}/bishop.png`} alt="piece" />
        <img src={`/assets/pieces/${pieceColor}/knight.png`} alt="piece" />
        <img src={`/assets/pieces/${pieceColor}/rook.png`} alt="piece" />
        <img src={`/assets/pieces/${pieceColor}/pawn.png`} alt="piece" />
    </div>
}