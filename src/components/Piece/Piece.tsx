import type { Piece } from "../../types/piece";

type PieceProps = {
    piece: Piece
}

export default function Piece({piece}: PieceProps) {
    return <div className="piece-container">
        <img src={`/assets/pieces/${piece.color}/${piece.type}.png`} alt={`${piece.color} ${piece.type}`} />
        Piece {piece.color}: {piece.type}
    </div>
}