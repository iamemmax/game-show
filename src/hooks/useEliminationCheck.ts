import { useState, useEffect } from 'react';
import { tokenStorage } from '@/utils/auth';
import { useGetGameContestants } from '@/app/admin/misc/api/contestants';

export function useEliminationCheck() {
  const [isEliminated, setIsEliminated] = useState(false);
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  const user = tokenStorage.getUser();
  
  const { data: allContestants } = useGetGameContestants(
    user?.game_episode as number
  );

  useEffect(() => {
    if (allContestants?.data && user?.contestant_id) {
      const currentContestant = allContestants.data.find(
        (contestant) => contestant.id === user.contestant_id
      );

      if (currentContestant?.is_eliminated) {
        setIsEliminated(true);
        setShowEliminationModal(true);
      }
    }
  }, [allContestants?.data, user?.contestant_id]);

  return {
    isEliminated,
    showEliminationModal,
    setShowEliminationModal
  };
}