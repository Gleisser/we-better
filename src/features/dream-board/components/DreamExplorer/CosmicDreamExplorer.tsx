import React from 'react';
import { Dream } from '../../types';
import { CosmicDreamExperience } from '../CosmicDreamExperience/CosmicDreamExperience';

interface CosmicDreamExplorerProps {
  dreams: Dream[];
  onDreamSelect: (dream: Dream) => void;
  activeDream: Dream | null;
}

export const CosmicDreamExplorer: React.FC<CosmicDreamExplorerProps> = ({
  dreams,
  onDreamSelect,
  activeDream,
}) => {
  // Extract all unique categories from dreams
  const categories = [...new Set(dreams.map(dream => dream.category))];

  // Create an adapter function to handle the type difference
  const handleDreamSelect = (dream: Dream | null): void => {
    if (dream) {
      onDreamSelect(dream);
    }
  };

  return (
    <CosmicDreamExperience
      dreams={dreams}
      categories={categories}
      onDreamSelect={handleDreamSelect}
      activeDream={activeDream}
    />
  );
};
