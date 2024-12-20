import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import SideNavBar from './SideNavBar';
import orderService from '../services/order-service';
import toast from 'react-hot-toast';

Modal.setAppElement('#root');

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await orderService.getAllOrders();

      if (!response) {
        toast.error('Something went wrong. Please try again!');
        return;
      }

      if (response && response.error) {
        toast.error(response.error);
        return;
      }

      setOrders(response);
    };

    fetchOrders();
  }, []);

  return (
    <div className='admin-panel'>
      <SideNavBar />
      <div className='orders-admin'>
        <div className='header'>
          <h2>Orders</h2>
        </div>
        <table className='orders-table'>
          <thead>
            <tr>
              <th>User</th>
              <th>Side Meal</th>
              <th>Meal 1</th>
              <th>Meal 2</th>
              <th>Meal 3</th>
              <th>Address</th>
              <th>Apartment No.</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.user.full_name}</td>
                <td>{order.sideMeal}</td>
                <td>{order.mealOne.code}</td>
                <td>{order.mealTwo.code}</td>
                <td>{order.mealThree.code}</td>
                <td>{order.address}</td>
                <td>{order.appartmentNumber}</td>
                <td>${order.totalPrice}</td>
                <td>{order.status}</td>
                <td>{order.startDate}</td>
                <td>{order.endDate}</td>
                {order.status !== 'Cancelled' && order.isFirstOrder && <td>Air fryer to be delivered</td>}
                {order.status !== 'Cancelled' && !order.isFirstOrder && <td>No actions required</td>}
                {order.status === 'Cancelled' && (
                  <td>Air fryer to be returned</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
