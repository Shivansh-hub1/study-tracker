import { CardSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="grid">
      <div className="grid grid-4">
        <CardSkeleton height={46} />
        <CardSkeleton height={46} />
        <CardSkeleton height={46} />
        <CardSkeleton height={46} />
      </div>
      <div className="grid grid-2">
        <CardSkeleton height={260} />
        <CardSkeleton height={260} />
      </div>
    </div>
  );
}
