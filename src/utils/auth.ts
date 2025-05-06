import { ContestantDetails } from "@/types/types";

// Extended type for user with game_episode
interface ExtendedContestantDetails extends ContestantDetails {
  game_episode?: number;
}

const TOKEN_STORAGE_PREFIX = 'SALARY_4_LIFE';

export const tokenStorage = {
  getToken: () => typeof window !== 'undefined' ?
    JSON.parse(
      window.localStorage.getItem(`${TOKEN_STORAGE_PREFIX}_TOKEN`) as string,
    )
    :
    null,

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `${TOKEN_STORAGE_PREFIX}_TOKEN`,
        JSON.stringify(token),
      );
    }
  },

  getUser: () => typeof window !== 'undefined' ?
    JSON.parse(
      window.localStorage.getItem(`${TOKEN_STORAGE_PREFIX}_USER`) as string,
    ) as ExtendedContestantDetails | null
    :
    null,

  setUser: (user: ExtendedContestantDetails) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `${TOKEN_STORAGE_PREFIX}_USER`,
        JSON.stringify(user),
      );
    }
  },

  clearToken: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(`${TOKEN_STORAGE_PREFIX}_TOKEN`);
      window.localStorage.removeItem(`${TOKEN_STORAGE_PREFIX}_USER`);
    }
  },
};
