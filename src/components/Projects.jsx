import LightboxImage from './LightboxImage';
import desktopImg from '../assets/hero-image.png'; // use your own images
import anotherImg from '../assets/logo.png'; // placeholder

export default function Projects() {
  return (
    <section style={{ padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>My Projects</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <LightboxImage src={desktopImg} alt="Hero Image Project" />
        <LightboxImage src={anotherImg} alt="Logo Project" />
      </div>
    </section>
  );
}
