Approche courte

Maintenir un board central (array 64) contenant null ou objet piece { type, color, sprite } dans useChessStore.
Gérer sélection: 1 clic sélectionne une pièce (si c'est le tour), 2e clic déplace si la destination est dans les coups légaux.
Calculer coups légaux via une fonction legalMovesFrom(index) (moteur basique ou règles séparées).
Square écoute les clics et appelle selectSquare / movePiece du store. Met en évidence sélection et destinations.
Exemple concret : Square.tsx qui utilise le store (suppose que useChessStore expose board, selectedIndex, currentTurn, selectSquare, movePiece, legalMovesFrom).



// ...existing code...
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
    const { board, selectedIndex, currentTurn, selectSquare, movePiece, legalMovesFrom } = useChessStore()

    const piece = board?.[index] ?? null
    const isSelected = selectedIndex === index
    const legalMoves = selectedIndex != null ? legalMovesFrom(selectedIndex) : []
    const isMoveTarget = legalMoves.includes(index)

    const onClick = () => {
        // désélection si re-clic sur la même case
        if (isSelected) { selectSquare(null); return }

        // si une pièce est déjà sélectionnée et la destination est légale -> move
        if (selectedIndex != null) {
            if (isMoveTarget) {
                movePiece(selectedIndex, index)
                selectSquare(null)
                return
            }
            // sinon, tenter de sélectionner une autre pièce du même joueur
        }

        // sélectionner si case contient une pièce du joueur courant
        if (piece && piece.color === currentTurn) {
            selectSquare(index)
        } else {
            // clique sur vide/ennemi sans sélection valide : rien ou affichage d'erreur
            selectSquare(null)
        }
    }

    const classes = [
        'square',
        isDarkSquare ? 'dark' : 'light',
        isSelected ? 'selected' : '',
        isMoveTarget ? 'move-target' : ''
    ].join(' ').trim()

    return (
        <div className={classes} onClick={onClick} data-coord={coord} role="button" aria-label={coord}>
            {/* affiche la pièce si présente (adapter selon shape de piece) */}
            {piece ? <span className={`piece ${piece.color}-${piece.type}`}>{piece.symbol ?? ''}</span> : null}
            {/* utile pour debug */}
            <span className="coord">{coord}</span>
        </div>
    )
}
// ...existing code...





API minimale attendue dans useChessStore (exemples de signatures) — implémenter dans ton hook/store :

Conseils rapides

Représentation index-based facilite calculs : up = -8, down = +8, left = -1 (vérifier bord via col).
Séparer calcul des coups légaux dans engine/ (rules.ts) pour tests.
Mettre en évidence les cibles légales (classe CSS .move-target) et la case sélectionnée (.selected).
Commencer par mouvements simples (pion, rook) puis ajouter règles spéciales (en passant, roque, promotion).
Si tu veux, je peux :

modifier ton useChessStore existant pour y ajouter ces fonctions,
ou générer une implémentation minimale du store + legalMovesFrom pour pions/tours comme point de départ.