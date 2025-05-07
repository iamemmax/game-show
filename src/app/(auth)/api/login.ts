import { salaryAxios, setAxiosDefaultToken } from "@/lib/axios";
import { tokenStorage } from "@/utils/auth";
import { AxiosResponse } from "axios";
import { useMutation } from "react-query";
import { useAuth } from "@/contexts/authentication";
import { ContestantDetails } from "@/types/types";

interface TokenResponse {
  status: string;
  message: string;
  tokens: Tokens;
  contestant_details: ContestantDetails;
  game: Game;
}

interface Tokens {
  refresh: string;
  access: string;
}

interface Game {
  game_episode: number;
}

interface UserCredentialsDTO {
  login_code: string;
}

// Extended type for user with game_episode
interface ExtendedContestantDetails extends ContestantDetails {
  game_episode: number;
}

const login = (loginDto: UserCredentialsDTO): Promise<AxiosResponse<TokenResponse>> =>
  salaryAxios.post("api/accounts/contestant_login/", loginDto, {
    headers: {
      // Remove Authorization header for login request
      Authorization: undefined
    }
  });

export const useLogin = () => {
  const { authDispatch } = useAuth();

  return useMutation("login", login, {
    onSuccess: async ({ data }) => {
      const { tokens, contestant_details, game } = data;
      const { access: token } = tokens;

      tokenStorage.setToken(token);
      
      // Create the extended user object with game_episode
      const extendedUser: ExtendedContestantDetails = {
        ...contestant_details,
        game_episode: game.game_episode
      };
      
      tokenStorage.setUser(extendedUser);
      setAxiosDefaultToken(token, salaryAxios);

      if (authDispatch) {
        authDispatch({ type: "LOGIN", payload: extendedUser });
        authDispatch({ type: "STOP_LOADING" });
      }
    },
  });
  };
