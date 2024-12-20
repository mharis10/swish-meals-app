import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MainScreen from './pages/MainScreen/MainScreen';
import HomeScreen from './pages/HomeScreen/HomeScreen';
import OrderScreen from './pages/OrderScreen/OrderScreen';
import Dashboard from './components/Dashboard';
import Meals from './components/Meals';
import Orders from './components/Orders';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<MainScreen />} />
          <Route exact path='/home' element={<HomeScreen />} />
          <Route exact path='/buy' element={<OrderScreen />} />
          <Route exact path='/dashboard' element={<Dashboard />} />
          <Route exact path='/meals' element={<Meals />} />
          <Route exact path='/orders' element={<Orders />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
