import LoadingSpinner from '@/shared/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <LoadingSpinner size="lg" />
    </div>
  );
}
