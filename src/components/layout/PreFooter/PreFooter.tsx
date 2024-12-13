import styles from './PreFooter.module.css';

const PreFooter = () => {
  return (
    <section className={styles.preFooterContainer}>
      <div className={styles.preFooterContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <h2 className={styles.title}>
            Create your next{' '}
            <span className={styles.highlight}>artwork</span>
            , with the power of Leonardo Ai
          </h2>
          
          <div className={styles.actionContainer}>
            <a 
              href="https://leonardo.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.button}
            >
              Start using Leonardo
              <svg 
                className={styles.arrow} 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none"
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <p className={styles.note}>No credit card needed</p>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          <div className={styles.imageContainer}>
            <img
              src="/assets/images/prefooter/prefooter.webp"
              alt="Leonardo AI Platform"
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter; 