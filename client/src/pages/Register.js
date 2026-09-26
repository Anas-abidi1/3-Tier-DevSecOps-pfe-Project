import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../logo.svg';

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Same fix as Login.js: register() never throws, so check the result
    // explicitly instead of navigating unconditionally.
    const result = await register(form.name, form.email, form.password);
    setSubmitting(false);

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="container fade-in">
      <img src={logo} alt="logo" className="logo" />
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          className="form-field"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          className="form-field"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="form-field"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
