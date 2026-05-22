export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-bold ${className}`}>
      <span className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        NURAI
      </span>
    </div>
  );
}
