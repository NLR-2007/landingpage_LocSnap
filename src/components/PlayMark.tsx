/* Google Play's mark, drawn rather than fetched.

   An image would be one more request that can fail and one more asset to
   keep; this is four paths. It is drawn in Google's own four colours because
   the single-colour version we had read as a paper plane - the thing that
   makes this mark recognisable at 16px is the colour, not the outline.

   Sits on a white disc wherever the button behind it is coloured, so the
   cyan does not disappear into a teal background. */

export default function PlayMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M3.6 1.8 13.8 12 3.6 22.2a2 2 0 0 1-.6-1.43V3.24c0-.56.23-1.07.6-1.44z" fill="#00D2FF" />
      <path d="M3.6 1.8a2 2 0 0 1 1.4-.17l11.8 6.7-3 3L3.6 1.81z" fill="#00F076" />
      <path d="m16.8 8.99 3.86 2.2c.78.44.78 1.18 0 1.62l-3.86 2.2-3-3.01 3-3.01z" fill="#FFCE00" />
      <path d="m13.8 12 3 3.01-11.8 6.7c-.47.13-.97.07-1.4-.17L13.8 12z" fill="#FF3A44" />
    </svg>
  );
}

/** The mark on a white disc, for use on a coloured button. */
export function PlayMarkDisc({ size = 'h-7 w-7' }: { size?: string }) {
  return (
    <span className={`grid ${size} flex-none place-items-center rounded-full bg-white/95`}>
      <PlayMark className="h-4 w-4" />
    </span>
  );
}
