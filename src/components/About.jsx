import Icon from './Icon.jsx';
import SectionHead from './SectionHead.jsx';
import { useInView } from '../hooks/hooks.js';
import { ABOUT_IDS, PAGES } from '../data.js';
import { openWithTransition } from '../pageTransition.js';

// Fades in as it enters the viewport and fades back out as it leaves
function AboutRow({ id }) {
  const p = PAGES[id];
  const [ref, visible] = useInView({ threshold: 0.2, rootMargin: '-6% 0px -6% 0px' });
  return (
    <article ref={ref} className={`about-row fade${visible ? ' in' : ''}`}>
      <Icon name={p.icon} className="ic big-ic" />
      <div>
        <span className="eyebrow">{p.title}</span>
        <h3>{p.title}</h3>
        <p style={{ marginTop: 14 }}>{p.blurb}</p>
        <a className="link-arrow" href={`#${id}`} onClick={(e) => openWithTransition(e, id)}>Explore {p.title} <Icon name="arrow" /></a>
      </div>
      <div>
        <p className="small-label">Focus areas</p>
        <ul className="chips">
          {p.items.map((i) => <li key={i[0]}>{i[0]}</li>)}
        </ul>
      </div>
    </article>
  );
}

export default function About() {
  return (
    <section className="sec" id="about">
      <div className="wrap">
        <SectionHead eyebrow="About us" title="What we focus on">
          Delta is organised around Four specialized tracks. Dedicated mentors. Real-world impact. Dive into our core pillars—Research, Engineering, Sustainability, and Media—to see what we’re building.
        </SectionHead>
        <div className="about-list">
          {ABOUT_IDS.map((id) => <AboutRow key={id} id={id} />)}
        </div>
      </div>
    </section>
  );
}
