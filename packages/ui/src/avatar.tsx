interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };

function initials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name} className={`rounded-full object-cover ${SIZE[size]} ${className ?? ''}`} />;
  }
  return (
    <div className={`rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-semibold text-white ${SIZE[size]} ${className ?? ''}`}>
      {initials(name)}
    </div>
  );
}
