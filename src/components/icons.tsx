type P = { size?: number };
const base = (size = 24) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const });
export const Back = ({ size }: P) => <svg {...base(size)}><path d="m15 6-6 6 6 6" /></svg>;
export const Chevron = ({ size }: P) => <svg {...base(size)}><path d="m9 6 6 6-6 6" /></svg>;
export const Close = ({ size }: P) => <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const Check = ({ size }: P) => <svg {...base(size)}><path className="check-path" d="m5 12 5 5 9-10" /></svg>;
export const Plus = ({ size }: P) => <svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>;
export const Pin = ({ size }: P) => <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="currentColor" /><circle cx="12" cy="9" r="2.5" fill="#fff" /></svg>;
