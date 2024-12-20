import React, { useEffect, useState } from 'react';
import './HomeScreen.css';
import { useNavigate } from 'react-router-dom';

function HomeScreen() {
  const navigate = useNavigate();

  const [user, setUser] = useState();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, []);

  return (
    <div className='home-container'>
      <nav className='home-navigation'>
        <span className='logo-image-white' onClick={() => navigate('/')}></span>
        <div>
          {user?.user.is_admin && (
            <button onClick={() => navigate('/dashboard')}>Admin Panel</button>
          )}
          <button onClick={() => navigate('/home')}>Home</button>
          <button onClick={() => navigate('/buy')}>Buy</button>
        </div>
      </nav>

      <div className='tagline-section'>
        <div className='tagline-container'>
          <h1>Your next meal cooks itself.</h1>
          <p>
            Who needs the hassle of prepping and cooking? Not you. Our meals
            redefine convenience: we handle the prep, and deliver straight to
            your door. Just pop our expertly crafted meals into your air fryer,
            and in minutes, you're devouring crispy, piping hot perfection. It's
            the convenience of fast food with the quality of a personal
            chef—minus the fancy pants. Welcome to the new era of easy,
            air-fried, tasty eats.
          </p>
        </div>
        <div className='image-container'></div>
      </div>

      <h1>As Easy As 1,2,3...</h1>
      <div className='how-it-works'>
        <div className='step'>
          <h2>1</h2>
          <h3>Place Order</h3>
          <p>
            Select 3 meals each week that fit your preference. We currently have
            11 meal options and are continually expanding and adding meal
            options. S your choice of White Rice, Brown Rice or Salad each week.
          </p>
        </div>
        <div className='step'>
          <h2>2</h2>
          <h3>Receive Order</h3>
          <p>
            Meals are delivered every Monday. For your first meal cycle, you
            will be sent an XDS Dual Bucket Air-Fryer. You will own this
            Air-Fryer for the duration of your subscription.
          </p>
        </div>
        <div className='step'>
          <h2>3</h2>
          <h3>Eat Order</h3>
          <p>
            Pop the proteins in one bucket of the Air-Fryer, and the veggies in
            the other. Set the temperature and time, and you’re a few minutes
            away from a fully cooked meal. Bon Appétit!
          </p>
        </div>
      </div>

      <h1>Why Choose Us?</h1>
      <div className='why-choose-us'>
        <div className='reason'>
          <span className='icon1'></span>
          <h3>Cost-Effective</h3>
          <p>
            At 10 dollars per meal, including delivery, cooking.sucks meals are
            cheaper than Panda Express, Subway, or whatever garbage you’re
            getting on campus...
          </p>
        </div>
        <div className='reason'>
          <span className='icon2'></span>
          <h3>Deliciously Healthy</h3>
          <p>
            Say goodbye to bland and boring health food. Our dishes are packed
            with flavors and are healthier than any alternative. Treat
            yourself—your palate deserves it!
          </p>
        </div>
        <div className='reason'>
          <span className='icon3'></span>
          <h3>Supa Fast</h3>
          <p>
            Time is precious, and with our meals, you won't waste a minute.
            Air-fry a feast in the flash of an eye – faster than you can spell
            'hangry'. Just heat, eat, and conquer your Psets with gourmet that
            waits for no one.
          </p>
        </div>
      </div>

      <h1>Frequently Asked Questions</h1>
      <div className='faq'>
        <div className='faq-column'>
          <div className='question'>
            <h3>Do I own the Air-Fryer Forever?</h3>
            <p>
              No. We recover the Air-Fryers in the case that you terminate your
              subscription. Otherwise, you can hold onto the Air-Fryer for as
              long as you’re subscribed.
            </p>
          </div>
          <div className='question'>
            <h3>What if I'm not home for the delivery?</h3>
            <p>
              No stress! Our packaging is designed to keep your meals fresh for
              hours. So even if you're out conquering the world, your food will
              stay cool and safe until you're back. Just grab it, air-fry it,
              and enjoy your hassle-free feast.
            </p>
          </div>
        </div>
        <div className='faq-column'>
          <div className='question'>
            <h3>How do the air fryers work with your meals?</h3>
            <p>
              Our air fryers are pre-programmed with the settings for each meal
              to ensure you get a perfect meal. Simply select the corresponding
              meal button and in no time, you'll be savoring convenient, healthy
              meals.
            </p>
          </div>
          <div className='question'>
            <h3>How long do the meals last?</h3>
            <p>
              Our meals are designed to last refrigerated— not frozen. We think
              that healthy meals are fresh meals and accordingly, these meals
              will last 3-4 days in the fridge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
