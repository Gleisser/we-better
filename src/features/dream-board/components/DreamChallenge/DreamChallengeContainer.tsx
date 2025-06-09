import React, { useState } from 'react';
import DreamChallenge from './DreamChallenge';
import ChallengeModal from './ChallengeModal';
import { Dream } from '../../types';
import { useDreamChallenges } from '../../hooks/useDreamChallenges';
import { CreateDreamChallengeInput } from '../../api/dreamChallengesApi';

interface DreamChallengeContainerProps {
  dreams: Dream[];
}

const DreamChallengeContainer: React.FC<DreamChallengeContainerProps> = ({ dreams }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null);
  const { createChallenge, updateChallenge, refreshChallenges, activeChallenges } =
    useDreamChallenges();

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingChallenge(null);
  };

  const handleEditChallenge = (challengeId: string): void => {
    setEditingChallenge(challengeId);
    setIsModalOpen(true);
  };

  const handleDeleteChallenge = (): void => {
    // The actual deletion is handled in the DreamChallenge component
    // This is just for consistency with the interface
  };

  const handleSaveChallenge = async (challengeData: CreateDreamChallengeInput): Promise<void> => {
    try {
      if (editingChallenge) {
        // Update existing challenge
        await updateChallenge({
          id: editingChallenge,
          ...challengeData,
        });
      } else {
        // Create new challenge
        await createChallenge(challengeData);
      }
      // Refresh the challenges list to ensure UI is updated
      await refreshChallenges();
    } catch (error) {
      console.error(`Failed to ${editingChallenge ? 'update' : 'create'} challenge:`, error);
      throw error; // Re-throw to allow modal to handle error state
    }
  };

  // Get the challenge being edited
  const currentEditingChallenge = editingChallenge
    ? activeChallenges.find(c => c.id === editingChallenge)
    : undefined;

  return (
    <>
      <DreamChallenge
        dreams={dreams}
        onOpenChallengeModal={handleOpenModal}
        onEditChallenge={handleEditChallenge}
        onDeleteChallenge={handleDeleteChallenge}
      />

      <ChallengeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveChallenge}
        dreams={dreams}
        editingChallenge={currentEditingChallenge}
      />
    </>
  );
};

export default DreamChallengeContainer;
