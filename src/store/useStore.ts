import create from 'zustand'

const useStore = create((set: any) => ({
  difficulty: 'EASY',
  setDifficulty: (difficulty: any) => set({ difficulty }),

  darkMode: false,
  toggleDarkMode: () => set((state: any) => ({ darkMode: !state.darkMode })),

  playerName: '',
  setPlayerName: (playerName: any) => set({ playerName }),

  isChangingName: false,
  toggleIsChangingName: () => set((state: any) => ({ isChangingName: !state.isChangingName })),

  gameInitialized: false,
  toggleGameInitialized: () => set((state: any) => ({ gameInitialized: !state.gameInitialized })),
}))

export default useStore
