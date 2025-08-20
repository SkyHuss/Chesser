import type { Color } from '../../types/piece';
import './PiecesPreview.css';

type PiecesPreviewProps = {
    color: Color;
};

export default function PiecesPreview({ color }: PiecesPreviewProps) {
    return <div className="pieces-preview-container">
        <img src={`/assets/pieces/${color}/king.png`} alt="piece" />
        <img src={`/assets/pieces/${color}/queen.png`} alt="piece" />
        <img src={`/assets/pieces/${color}/bishop.png`} alt="piece" />
        <img src={`/assets/pieces/${color}/knight.png`} alt="piece" />
        <img src={`/assets/pieces/${color}/rook.png`} alt="piece" />
        <img src={`/assets/pieces/${color}/pawn.png`} alt="piece" />
    </div>
}