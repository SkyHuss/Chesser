import { create } from "zustand";

interface ChessStore {
    isGameStarted: boolean;
    // whitePieces: Piece[];
    // blackPieces: Piece[];
}

export const useChessStore = create<ChessStore>()(() => ({
    isGameStarted: false,
    // whitePieces: [],
    // blackPieces: [],
}))

export const globalStartGame = () => {
    useChessStore.setState({isGameStarted: true});
}

export const globalStopGame = () => {
    useChessStore.setState({isGameStarted: false});
}