import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiMapPin, FiShield, FiStar, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const sectionsRef = useRef([]);
  const { user } = useAuth();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.style.opacity = '1';
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) {
        section.style.opacity = '0';
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const features = [
    { icon: '⚡', title: 'Quick Booking', desc: 'Book a cab in just 3 taps. Fast, simple, and hassle-free.' },
    { icon: '📍', title: 'Real-Time Tracking', desc: 'Track your ride live on the map. Know exactly where your driver is.' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Multiple payment options, fully secure. Cash, card, or wallet.' },
    { icon: '🌟', title: '24/7 Support', desc: 'Round the clock customer assistance for all your needs.' },
  ];

  const steps = [
    { num: 1, title: 'Choose Location', desc: 'Pick your pickup & drop location on the map or type an address.' },
    { num: 2, title: 'Select Ride', desc: 'Choose your ride type, review fare estimate, and confirm your booking.' },
    { num: 3, title: 'Enjoy Ride', desc: 'Your driver arrives, verify OTP, and enjoy your comfortable ride.' },
  ];

  const vehicles = [
    { emoji: '🛺', name: 'Auto', capacity: '3 seater', rate: '₹12/km' },
    { emoji: '🏍️', name: 'Bike', capacity: '1 seater', rate: '₹8/km' },
    { emoji: '🚗', name: 'Sedan', capacity: '4 seater', rate: '₹15/km' },
    { emoji: '🚙', name: 'SUV', capacity: '6 seater', rate: '₹20/km' },
  ];

  const stats = [
    { value: '10K+', label: 'Rides Completed' },
    { value: '5K+', label: 'Happy Users' },
    { value: '1K+', label: 'Active Drivers' },
    { value: '4.8★', label: 'Average Rating' },
  ];

  const testimonials = [
    { name: 'Rahul S.', initials: 'RS', rating: 5, text: 'Best ride-hailing app I have used! The drivers are professional and the app is super smooth. Highly recommended!' },
    { name: 'Priya M.', initials: 'PM', rating: 5, text: 'Love the real-time tracking feature. I always feel safe knowing exactly where my ride is. Great experience!' },
    { name: 'Amit K.', initials: 'AK', rating: 4, text: 'Very affordable and reliable service. The wallet feature makes payments super convenient. Will use again!' },
  ];

  return (
    <div style={{ paddingTop: '70px' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="floating-shapes"></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', width: '100%', padding: '0 2rem', gap: '4rem', flexWrap: 'wrap' }}>
          <div className="hero-content">
            <h1 className="hero-title">
              Your Ride,<br />
              <span className="gradient-text">Your Way</span>
            </h1>
            <p className="hero-subtitle">
              Book your ride in seconds. Track in real-time. Travel with confidence.
              Experience the future of urban transportation.
            </p>
            <div className="hero-actions">
              {!user ? (
                <Link to="/book" className="btn btn-primary btn-lg">
                  Book a Ride <FiArrowRight />
                </Link>
              ) : (
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'driver' ? '/driver' : '/dashboard'} className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              )}
              <a href="#features" className="btn btn-secondary btn-lg">
                Learn More
              </a>
            </div>
          </div>
          <div className="hero-image">
            <div style={{ fontSize: '12rem', animation: 'float 6s ease-in-out infinite' }}>
              🚗
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features" ref={addRef}>
        <h2 className="section-title gradient-text">Why Choose Ucab?</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass-card">
              <div className="feature-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" ref={addRef}>
        <h2 className="section-title gradient-text">How It Works</h2>
        <div className="steps-container">
          {steps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-number">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicles */}
      <section className="vehicle-section" ref={addRef}>
        <h2 className="section-title gradient-text">Our Fleet</h2>
        <div className="vehicle-grid">
          {vehicles.map((v, i) => (
            <div key={i} className="vehicle-type-card glass-card">
              <div className="vehicle-emoji">{v.emoji}</div>
              <h3>{v.name}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{v.capacity}</p>
              <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.5rem', fontSize: '1.2rem' }}>{v.rate}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" ref={addRef}>
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" ref={addRef}>
        <h2 className="section-title gradient-text">What Our Users Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card glass-card">
              <div className="star-rating" style={{ marginBottom: '1rem' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`star ${s <= t.rating ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified User</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" ref={addRef}>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontFamily: 'Outfit' }}>Ready to Ride?</h2>
        <p>Join thousands of happy riders. Sign up today and get your first ride free!</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Get Started <FiChevronRight />
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="gradient-text" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>Ucab</span>
            <span style={{ marginLeft: '0.5rem' }}>© 2024 All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Register</Link>
            <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
