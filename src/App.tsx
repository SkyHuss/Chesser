
import './App.css'
import Chessboard from './components/Chessboard/Chessboard'
import PiecesPreview from './components/PiecesPreview/PiecesPreview'
import { globalStopGame, useChessStore } from './hooks/useChessStore';

export default function App() {

  const {isGameStarted, resetBoard} = useChessStore();

  return <div className='app-container'>
      {!isGameStarted && <PiecesPreview color="white" />}
      <Chessboard/>
      {!isGameStarted && <PiecesPreview color="black" />}

      {isGameStarted && 
        <div className="actions-btn-container">
          <button className="btn reset-button" onClick={resetBoard}>Reset game</button>
          <button className="btn stop-game-button" onClick={globalStopGame}>Stop Game</button>
        </div>
      }
  </div>
}