import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday
} from 'date-fns';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/common/icons';
import styles from './MonthlyView.module.css';

interface MonthlyViewProps {
  isOpen: boolean;
  onClose: () => void;
  habit: {
    name: string;
    category: string;
    completedDays: string[];
    streak: number;
  };
}

export const MonthlyView = ({ isOpen, onClose, habit }: MonthlyViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const isDateCompleted = (date: Date) => {
    return habit.completedDays.includes(format(date, 'yyyy-MM-dd'));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.container}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className={styles.header}>
              <div className={styles.habitInfo}>
                <h3 className={styles.habitName}>{habit.name}</h3>
                <div className={styles.streakBadge}>
                  🔥 {habit.streak} days
                </div>
              </div>
              <button onClick={onClose} className={styles.closeButton}>
                <XIcon className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.monthNavigation}>
              <button onClick={prevMonth} className={styles.navButton}>
                <ChevronLeftIcon className={styles.navIcon} />
              </button>
              <h4 className={styles.monthTitle}>
                {format(currentDate, 'MMMM yyyy')}
              </h4>
              <button onClick={nextMonth} className={styles.navButton}>
                <ChevronRightIcon className={styles.navIcon} />
              </button>
            </div>

            <div className={styles.calendar}>
              <div className={styles.weekDays}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className={styles.weekDay}>{day}</div>
                ))}
              </div>
              <div className={styles.days}>
                {getDaysInMonth().map(date => (
                  <div
                    key={date.toString()}
                    className={`${styles.day} 
                      ${!isSameMonth(date, currentDate) ? styles.otherMonth : ''} 
                      ${isDateCompleted(date) ? styles.completed : ''}
                      ${isToday(date) ? styles.today : ''}`}
                  >
                    {format(date, 'd')}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.completed}`} />
                  <span>Completed</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} />
                  <span>Missed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}; 