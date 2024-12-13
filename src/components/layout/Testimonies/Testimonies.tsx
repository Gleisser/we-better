import styles from './Testimonies.module.css';

const TESTIMONIALS = [
  {
    id: 1,
    text: "Leonardo gave me a way of expressing myself in a completely new and different way. Without AI I was only a consumer. Now I can create.",
    author: "Malakai030",
    avatar: "/assets/images/testimonies/profile_1.webp"
  },
  {
    id: 2,
    text: "Leo is suitable for those who are just starting their way in the world of AI images, as well as for professionals, who are offered a wide range of tools to work with.",
    author: "Raini Studios",
    avatar: "/assets/images/testimonies/profile_2.webp"
  },
  {
    id: 3,
    text: "With its powerful fined tuned models Leonardo makes A.I art a breeze. The community is also the best I've found to date!",
    author: "Dee Does A.I",
    avatar: "/assets/images/testimonies/profile_3.webp"
  }
] as const;

const Testimonies = () => {
  return (
    <section className={styles.testimoniesContainer}>
      <div className={styles.testimoniesContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            A community of over{' '}
            <span className={styles.highlight}>4 million</span>
            {' '}is waiting for you
          </h2>
          <p className={styles.description}>
            Leonardo's power extends beyond our revolutionary tools — we are anchored in one of the largest and most supportive AI communities worldwide, and we're deeply committed to it.
          </p>
        </div>

        <div className={styles.testimonials}>
          {TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <p className={styles.testimonialText}>"{testimonial.text}"</p>
              <div className={styles.author}>
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className={styles.avatar}
                />
                <span className={styles.authorName}>{testimonial.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonies; 