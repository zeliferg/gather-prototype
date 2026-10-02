// The full menu, the way a delivery app lists it: a caption per section, then one row per item with the
// name and price on the first line and a short description under it. Used by ORG 6c and ORG 10.
import type { MenuSection } from '../fixtures';

export function MenuList({ menu }: { menu: MenuSection[] }) {
  return (
    <div className="stack" style={{ gap: 18 }}>
      {menu.map((s) => (
        <section key={s.section} className="stack" style={{ gap: 2 }} aria-label={s.section}>
          <p className="t-caption c-secondary" style={{ marginBottom: 4 }}>{s.section}</p>
          {s.items.map((it) => (
            <div key={it.name} className="menu-item">
              <div className="row" style={{ gap: 12 }}><span className="t-body-med">{it.name}</span><span className="t-body c-secondary" style={{ flex: 'none' }}>{it.price}</span></div>
              {it.desc && <p className="t-caption c-secondary">{it.desc}</p>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
