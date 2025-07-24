
export const LastStepStorage = {
    getLastStep: () => {
        const lastStep = localStorage.getItem('THE_HUSTLE_GAME_LAST_STEP');
        console.log("Last Step from Storage:", lastStep);
        return lastStep ? JSON.parse(lastStep) : null;
    },

    setLastStep: (step: {
        step: string;
        gameEpisode?: string | number;
    }) => {
        localStorage.setItem('THE_HUSTLE_GAME_LAST_STEP', JSON.stringify(step));
    },

    clearLastStep: () => {
        localStorage.removeItem('THE_HUSTLE_GAME_LAST_STEP');
    }
}