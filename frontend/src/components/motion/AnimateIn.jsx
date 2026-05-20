/**
 * Enveloppe d’animation d’entrée (fade, slide, blur…).
 * @param {'fade-in-up'|'fade-in'|'scale-in'|'slide-down'|'slide-right'|'blur-in'|'page-enter'} animation
 */
export default function AnimateIn({
  children,
  className = '',
  animation = 'fade-in-up',
  delay = 0,
  as: Tag = 'div',
}) {
  const animMap = {
    'fade-in': 'animate-fade-in',
    'scale-in': 'animate-scale-in',
    'slide-down': 'animate-slide-down',
    'slide-right': 'animate-slide-in-right',
    'blur-in': 'animate-blur-in',
    'page-enter': 'animate-page-enter',
    'fade-in-up': 'animate-fade-in-up',
  };

  const animClass = animMap[animation] ?? 'animate-fade-in-up';

  return (
    <Tag
      className={`opacity-0 ${animClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
