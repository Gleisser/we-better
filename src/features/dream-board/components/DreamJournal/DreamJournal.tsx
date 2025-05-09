import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream, JournalEntry } from '../../types';

interface DreamJournalProps {
  dreams: Dream[];
  journalEntries: JournalEntry[];
  formatDate: (dateString: string) => string;
}

const DreamJournal: React.FC<DreamJournalProps> = ({ dreams, journalEntries, formatDate }) => {
  return (
    <div className={styles.journalTab}>
      {/* Dream Journal Integration */}
      <section className={styles.journalSection}>
        <h2>Dream Journal</h2>
        {journalEntries.map(entry => {
          const relatedDream = dreams.find(d => d.id === entry.dreamId);
          return (
            <div key={entry.id} className={styles.journalEntry}>
              <h3>Entry for "{relatedDream?.title}"</h3>
              <p className={styles.journalDate}>{formatDate(entry.date)}</p>
              <div className={styles.emotionBadge}>{entry.emotion}</div>
              <p className={styles.journalContent}>{entry.content}</p>
            </div>
          );
        })}
        <button className={styles.addEntryButton}>Add New Journal Entry</button>
      </section>
    </div>
  );
};

export default DreamJournal;
