import { useState, useEffect } from 'react';

const STORAGE_KEY = 'personal_affirmation';

interface PersonalAffirmation {
  id: string;
  text: string;
  category: 'personal';
  intensity: 2;
}

export const usePersonalAffirmation = () => {
  const [personalAffirmation, setPersonalAffirmation] = useState<PersonalAffirmation | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const saveAffirmation = (text: string) => {
    const newAffirmation: PersonalAffirmation = {
      id: 'personal_1',
      text,
      category: 'personal',
      intensity: 2
    };
    
    setPersonalAffirmation(newAffirmation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAffirmation));
  };

  const deleteAffirmation = () => {
    setPersonalAffirmation(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    personalAffirmation,
    saveAffirmation,
    deleteAffirmation
  };
}; 