/** A four-point sparkle, used as a separator and a bit of decoration. */
export default function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 0c.9 6.6 4.9 10.6 12 12-7.1 1.4-11.1 5.4-12 12-.9-6.6-4.9-10.6-12-12C7.1 10.6 11.1 6.6 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
