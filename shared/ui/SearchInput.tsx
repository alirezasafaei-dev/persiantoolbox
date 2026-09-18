'use client';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = 'جستجو...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-(--border-medium) bg-(--surface-1) py-2 pe-3 ps-10 text-sm text-(--text-primary) focus:border-primary focus:outline-hidden"
        dir="rtl"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary)"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
