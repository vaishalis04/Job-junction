import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import LoginSignup from './pages/auth/LoginSignup';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Placeholder components
const HomePage = () => (
  <div className="page-container">
    <h1>Welcome to MyApp</h1>
    <p>This is the home page</p>
  </div>
);

const AboutPage = () => (
  <div className="page-container">
    <h1>About Us</h1>
    <p>Learn more about our company</p>
  </div>
);

const ServicesPage = () => (
  <div className="page-container">
    <h1>Our Services</h1>
    <p>Discover what we offer</p>
  </div>
);

const ContactPage = () => (
  <div className="page-container">
    <h1>Contact Us</h1>
    <p>Get in touch with us</p>
  </div>
);

export default App;