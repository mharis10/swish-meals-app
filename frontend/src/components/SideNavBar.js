import React from 'react';
import { Link } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';

const SideNavBar = () => {
  return (
    <div className='side-nav'>
      <div className='back-link'>
        <Link to='/home' className='back-to-home'>
          <IoIosArrowBack /> Back
        </Link>
      </div>
      <h2>Admin Panel</h2>
      <ul>
        <li>
          <Link to='/dashboard'>Dashboard</Link>
        </li>
        <li>
          <Link to='/meals'>Meals</Link>
        </li>
        <li>
          <Link to='/orders'>Orders</Link>
        </li>
      </ul>
    </div>
  );
};

export default SideNavBar;
