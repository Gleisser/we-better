import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  name: string;
  image?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const UserAvatar = ({
  name,
  image,
  isOnline = false,
  size = 'md',
}: UserAvatarProps): JSX.Element => {
  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {image ? (
        <img src={image} alt={name} className={styles.image} />
      ) : (
        <div className={styles.fallback}>
          <span className={styles.initials}>{getInitials(name)}</span>
        </div>
      )}
      {isOnline && <div className={styles.onlineStatus} />}
    </div>
  );
};

export default UserAvatar;
