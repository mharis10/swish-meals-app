import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import './MainScreen.css';
import authService from '../../services/auth-service';
import userService from '../../services/user-service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

ReactModal.setAppElement('#root');

function MainScreen() {
  const navigate = useNavigate();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const [register, setRegister] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [login, setLogin] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const openModal = (login) => {
    setIsLogin(login);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      const data = await authService.login(login.email, login.password);

      if (data && data.error) {
        toast.error(data?.error);
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);

      toast.success('Login Successful!');

      setLogin({ email: '', password: '' });
    } else {
      if (!register.email.includes('stanford')) {
        toast.error('Only Stanford users are allowed to register');
        setIsLoading(false);
        return;
      }

      if (register.password !== register.confirmPassword) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const payload = {
        full_name: register.full_name,
        email: register.email,
        phone: register.phone,
        password: register.password,
        is_admin: false,
      };

      const data = await userService.signUp(payload);

      if (data && data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Sign Up Successful! Please login with your details');

      setRegister({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    }

    setIsLoading(false);
    closeModal();
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    toast.success('Logout Successful');
  };

  return (
    <div className='container'>
      <header className='header'>
        <span className='logo-main' onClick={() => navigate('/')}></span>
        <div className='navigation'>
          <button className='green-button' onClick={() => navigate('/home')}>
            Subscribe
          </button>
          {token ? (
            <button className='black-button' onClick={() => logout()}>
              Logout
            </button>
          ) : (
            <button className='black-button' onClick={() => openModal(true)}>
              Login/Signup
            </button>
          )}
        </div>
      </header>
      <main className='main'>
        <div className='content'>
          <h1>Your next meal cooks itself.</h1>
          <p className='blurb'>
            Who needs the hassle of prepping and cooking? Not you. Our meals
            redefine convenience: we handle the prep, and deliver straight to
            your door. Just pop our expertly crafted meals into your air fryer,
            and in minutes, you're devouring crispy, piping hot perfection. It's
            the convenience of fast food with the quality of a personal
            chef—minus the fancy pants. Welcome to the new era of easy,
            air-fried, tasty eats.
          </p>
          <button className='black-button' onClick={() => navigate('/home')}>
            Subscribe Now!
          </button>
          <button className='green-button' onClick={() => navigate('/home')}>
            Subscribe Now!
          </button>
        </div>
        <div className='image'></div>
      </main>
      <footer className='footer'>
        <button className='chat-button'>Let's Chat!</button>
      </footer>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className='Modal'
        overlayClassName='Overlay'
      >
        <div className='modal-content'>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleSubmit}>
            {isLogin ? (
              <>
                <input
                  type='email'
                  placeholder='Email'
                  required
                  value={login.email}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      email: e.target.value,
                    })
                  }
                />
                <input
                  type='password'
                  placeholder='Password'
                  required
                  value={login.password}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      password: e.target.value,
                    })
                  }
                />
                <button type='submit' disabled={isLoading}>
                  Login
                </button>
              </>
            ) : (
              <>
                <input
                  type='text'
                  placeholder='Name'
                  required
                  value={register.full_name}
                  onChange={(e) =>
                    setRegister({
                      ...register,
                      full_name: e.target.value,
                    })
                  }
                />
                <input
                  type='email'
                  placeholder='Email'
                  required
                  value={register.email}
                  onChange={(e) =>
                    setRegister({
                      ...register,
                      email: e.target.value,
                    })
                  }
                />
                <input
                  type='text'
                  placeholder='Phone'
                  required
                  value={register.phone}
                  onChange={(e) =>
                    setRegister({
                      ...register,
                      phone: e.target.value,
                    })
                  }
                />
                <input
                  type='password'
                  placeholder='Password'
                  required
                  value={register.password}
                  onChange={(e) =>
                    setRegister({
                      ...register,
                      password: e.target.value,
                    })
                  }
                />
                <input
                  type='password'
                  placeholder='Confirm Password'
                  required
                  value={register.confirmPassword}
                  onChange={(e) =>
                    setRegister({
                      ...register,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button type='submit' disabled={isLoading}>
                  Sign Up
                </button>
              </>
            )}
          </form>
          {isLogin ? (
            <p className='toggle-form-text'>
              Don't have an account?{' '}
              <span onClick={() => setIsLogin(false)}>Sign Up!</span>
            </p>
          ) : (
            <p className='toggle-form-text'>
              Already have an account?{' '}
              <span onClick={() => setIsLogin(true)}>Login!</span>
            </p>
          )}
        </div>
      </ReactModal>
    </div>
  );
}

export default MainScreen;
