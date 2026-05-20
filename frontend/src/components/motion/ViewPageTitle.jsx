import AnimateIn from './AnimateIn.jsx';

/**
 * Titre de page avec effet shine et entrée animée.
 */
export default function ViewPageTitle({ children, subtitle, className = '' }) {
  return (
    <AnimateIn animation="blur-in" delay={40} className={`mb-6 text-center ${className}`}>
      <h1 className="text-shine-dark font-display text-display-sm font-extrabold sm:text-display-md">
        {children}
      </h1>
      {subtitle ? (
        <p className="text-lead mt-2 text-brand-dark/75 transition-colors duration-300 hover:text-brand-dark">
          {subtitle}
        </p>
      ) : null}
    </AnimateIn>
  );
}
