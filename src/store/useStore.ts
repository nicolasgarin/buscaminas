import create from 'zustand'

const useStore = create((set) => ({
  difficulty: 'EASY',
  setDifficulty: (difficulty) => set({ difficulty }),

  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  playerName: '',
  setPlayerName: (playerName) => set({ playerName }),

  isChangingName: false,
  toggleIsChangingName: () => set((state) => ({ isChangingName: !state.isChangingName })),

  gameInitialized: false,
  toggleGameInitialized: () => set((state) => ({ gameInitialized: !state.gameInitialized })),
}))

export default useStore
