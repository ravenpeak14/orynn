/** A soft, quiet backdrop that gives glass surfaces something to blur. */
export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-accent/12 blur-3xl" />
      <div className="absolute top-48 -right-32 h-72 w-72 rounded-full bg-cat-pink/12 blur-3xl" />
      <div className="absolute bottom-0 -left-32 h-72 w-72 rounded-full bg-cat-blue/10 blur-3xl" />
    </div>
  )
}
