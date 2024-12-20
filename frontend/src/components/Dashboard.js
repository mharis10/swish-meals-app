import React, { useState } from 'react';
import SideNavBar from './SideNavBar';
import statsService from '../services/stats-service';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({
    weekStart: '',
    weekEnd: '',
    totalOrders: 0,
    mealCountByCode: {},
    sideCounts: {},
    mealTypeCount: {},
  });

  const fetchWeeklyStats = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates.');
      return;
    }

    const response = await statsService.getWeeklyStats(fromDate, toDate);

    if (!response) {
      toast.error('Something went wrong. Please try again!');
      return;
    }

    if (response && response.error) {
      toast.error(response.error);
      return;
    }

    setWeeklyStats(response);
  };

  const sendWeeklyStats = async () => {
    if (!weeklyStats.weekStart || !weeklyStats.weekEnd) {
      toast.error(
        'Weekly stats are not loaded. Please fetch stats before sending.'
      );
      return;
    }

    const response = await statsService.sendWeeklyStats(weeklyStats);

    if (!response) {
      toast.error('Something went wrong. Please try again!');
      return;
    }

    if (response && response.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Email sent successfully!');
  };

  const StatsTable = ({ title, data }) => (
    <div className='stats-table-container'>
      <h3>{title}</h3>
      {Object.keys(data).length ? (
        <table className='stats-table'>
          <thead>
            <tr>
              <th>{title} Code</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data to display</p>
      )}
    </div>
  );

  return (
    <div className='admin-panel'>
      <SideNavBar />
      <div className='dashboard'>
        <h2>Weekly Stats</h2>
        <div className='date-selection'>
          <label for='from-date'>From Date:</label>
          <input
            id='from-date'
            type='date'
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <label for='to-date'>To Date:</label>
          <input
            id='to-date'
            type='date'
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button onClick={fetchWeeklyStats}>Fetch Stats</button>
        </div>
        <div className='stats-section'>
          <StatsTable title='Meals' data={weeklyStats.mealCountByCode} />
          <StatsTable title='Sides' data={weeklyStats.sideCounts} />
          <StatsTable title='Meal Types' data={weeklyStats.mealTypeCount} />
        </div>

        <div className='stats-buttons'>
          <button onClick={sendWeeklyStats}>Send Weekly Stats</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;