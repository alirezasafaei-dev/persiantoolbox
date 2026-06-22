'use client';

type AvatarProps = {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index] ?? 'bg-blue-500';
}

export default function Avatar({ name, image, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full font-bold text-white ${getColor(name)}`}
    >
      {image ? (
        <img src={image} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
