import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfileFormProps, UserProfileData } from '../types';
import styles from '../WelcomeSequence.module.css';

// Predefined interest options
const INTEREST_OPTIONS = [
  'Physical Fitness', 'Mental Health', 'Sleep',
  'Career Growth', 'Relationships', 'Finance', 'Good Habits', 'Learning',
  'Self-Care', 'Stress', 'Health', 'Other'
];

// Checkmark icon component for selected interests
const CheckmarkIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none"
    style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
    }}
  >
    <motion.path
      d="M5 13L9 17L19 7"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    />
  </svg>
);

// Arrow icon for continue button
const ArrowIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    style={{ marginLeft: '8px' }}
  >
    <path 
      d="M5 12H19M19 12L12 5M19 12L12 19" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// Skip icon for the skip button
const SkipIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    style={{ marginRight: '8px' }}
  >
    <path 
      d="M19 5L5 19M5 5L19 19" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </svg>
);

const UserProfileForm = ({ onSubmit, onCancel, initialData = {} }: UserProfileFormProps) => {
  const [formData, setFormData] = useState<UserProfileData>({
    gender: initialData.gender,
    ageRange: initialData.ageRange,
    interests: initialData.interests || [],
    primaryGoal: initialData.primaryGoal || '',
    sleepQuality: initialData.sleepQuality,
    stressLevel: initialData.stressLevel,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const interests = [...(prev.interests || [])];
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...interests, interest] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.form 
      className={styles.profileForm}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h2 
        className={styles.formTitle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Customize Your Experience
      </motion.h2>
      <motion.p 
        className={styles.formDescription}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Help us tailor content specifically for you.
      </motion.p>

      <div className={styles.formGroup}>
        <label htmlFor="gender">Gender (Optional)</label>
        <select 
          id="gender" 
          name="gender" 
          value={formData.gender || ''} 
          onChange={handleChange}
          className={styles.formSelect}
        >
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ageRange">Age Range (Optional)</label>
        <select 
          id="ageRange" 
          name="ageRange" 
          value={formData.ageRange || ''} 
          onChange={handleChange}
          className={styles.formSelect}
        >
          <option value="">Prefer not to say</option>
          <option value="under-18">Under 18</option>
          <option value="18-24">18-24</option>
          <option value="25-34">25-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55-64">55-64</option>
          <option value="65+">65+</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Areas of Interest (Select all that apply)</label>
        <div className={styles.interestGrid}>
          {INTEREST_OPTIONS.map(interest => (
            <motion.div 
              key={interest}
              className={`${styles.interestTag} ${formData.interests?.includes(interest) ? styles.selected : ''}`}
              onClick={() => handleInterestToggle(interest)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {interest}
              {formData.interests?.includes(interest) && <CheckmarkIcon />}
            </motion.div>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <motion.button 
            type="button" 
            onClick={onCancel}
            className={styles.secondaryButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipIcon /> <span>Skip</span>
          </motion.button>
        )}
        <motion.button 
          type="submit" 
          className={styles.primaryButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Continue</span> <ArrowIcon />
        </motion.button>
      </div>
    </motion.form>
  );
};

export default UserProfileForm; 