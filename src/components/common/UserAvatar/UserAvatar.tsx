import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  name: string;
  image?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar = ({ name, image, isOnline, size = 'md' }: UserAvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {image ? (
        <img src={image} alt={name} className={styles.image} />
      ) : (
        <div className={styles.fallback}>
          <span>{getInitials(name)}</span>
        </div>
      )}
      {isOnline && <div className={styles.status} />}
    </div>
  );
};

export default UserAvatar; 