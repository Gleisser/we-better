import { Link } from 'react-router-dom';

interface CtaButtonProps {
  text?: string;
  'aria-label'?: string;
}

const CtaButton = ({
  text = 'Get Started',
  'aria-label': ariaLabel,
}: CtaButtonProps): JSX.Element => {
  return (
    <Link
      to="/auth/signup"
      className="bg-white text-[#6f42c1] px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors"
      aria-label={ariaLabel ?? text}
    >
      {text}
    </Link>
  );
};

export default CtaButton;
