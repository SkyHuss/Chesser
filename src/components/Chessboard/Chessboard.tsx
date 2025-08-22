import { globalStartGame, useChessStore } from '../../hooks/useChessStore';
import { indexToCoord } from '../../utils/utils';
import Square from '../Square/Square';
import './Chessboard.css'

export default function Chessboard() {

    const {isGameStarted, isGameOver, winner} = useChessStore();


    const renderSquare = (i: number) => {
        const meta = indexToCoord(i);
        return <Square 
            key={i}
            index={meta.index}
            coord={meta.coord}
            isDarkSquare={meta.isDarkSquare}
        />
    }

    const squares = Array.from({length: 64}, (_, i) => renderSquare(i));

    return <div className="chessboard-container">
        
        {(!isGameStarted || isGameOver) && 
            <div className="start-game-button" onClick={globalStartGame}>
                Start new game
            </div>
        }

        {isGameOver &&
            <div className="resume">The {winner} win the game!</div>
        }

        {isGameStarted && 
            <div className="chessboard">{squares}</div>
        }

    </div>
}