import { globalStartGame, useChessStore } from '../../hooks/useChessStore';
import Square from '../Square/Square';
import './Chessboard.css'

export default function Chessboard() {

    const {isGameStarted} = useChessStore();

    const files = 'abcdefgh';

    const indexToCoord = (index: number) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const file = files[col];
        const rank = 8 - row;
        const coord = `${file}${rank}`;
        const isDarkSquare = (row + col) % 2 === 1;

        return { index, row, col, file, rank, coord, isDarkSquare};
    }


    const renderSquare = (i: number) => {
        const meta = indexToCoord(i);
        return <Square 
            key={i}
            index={meta.index}
            coord={meta.coord}
            file={meta.file}
            rank={meta.rank}
            isDarkSquare={meta.isDarkSquare}
        />
    }

    const squares = Array.from({length: 64}, (_, i) => renderSquare(i));

    return <div className="chessboard-container">
        
        {!isGameStarted && 
            <div className="start-game-button" onClick={globalStartGame}>
                Start new game
            </div>
        }

        {isGameStarted && 
            <div className="chessboard">{squares}</div>
        }

    </div>
}