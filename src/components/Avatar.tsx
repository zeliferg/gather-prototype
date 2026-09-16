export function Avatar({ initial, size = 40 }: { initial: string; size?: number }) {
  return <span className="avatar t-label" style={{ width: size, height: size }} aria-hidden>{initial}</span>;
}
