import React, { useState, useEffect, useCallback } from 'react';
import './OrderScreen.css';
import { useNavigate, useLocation } from 'react-router-dom';
import mealService from '../../services/meal-service';
import toast from 'react-hot-toast';
import orderService from '../../services/order-service';
import { IoTrashBin, IoAdd, IoRemove } from 'react-icons/io5';
import subscriptionService from '../../services/subscription-service';
import { apiHost } from '../../services/host';

function OrderScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState();
  const [meals, setMeals] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [selectedSide, setSelectedSide] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [address, setAddress] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [
    subscriptionManagementAvailableDate,
    setSubscriptionManagementAvailableDate,
  ] = useState(null);

  const sideDishes = [
    { label: 'White Rice', value: 'White Rice' },
    { label: 'Brown Rice', value: 'Brown Rice' },
    { label: 'Salad', value: 'Salad' },
  ];

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, []);

  const updateOrder = useCallback(
    async (sessionId, orderId) => {
      const payload = {
        sessionId,
        orderStatus: 'Confirmed',
      };

      const response = await orderService.updateMyOrder(orderId, payload);

      if (!response) {
        toast.error('Something went wrong. Please try again!');
        return;
      }

      if (response && response?.error) {
        toast.error(response.error);
        return;
      }

      navigate(window.location.pathname, { replace: true });
      setActiveOrder(response.updatedOrder);
      setHasActiveOrder(true);
      if (response.updatedOrder.isDelayedSubscription) {
        setSubscriptionManagementAvailableDate(
          new Date(response.updatedOrder.startDate).toISOString().split('T')[0]
        );
      } else {
        setSubscriptionManagementAvailableDate(null);
      }
      toast.success('Order placed successfully!');
    },
    [navigate]
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const status = queryParams.get('status');

    if (status === 'error') {
      toast.error('Payment unsuccessful. Please try again!');
      navigate(window.location.pathname, { replace: true });
      return;
    }

    const sessionId = queryParams.get('session_id');
    const orderId = queryParams.get('orderId');

    if (sessionId && orderId) {
      updateOrder(sessionId, orderId);
    }
  }, [location, navigate, updateOrder]);

  useEffect(() => {
    const fetchActiveOrder = async () => {
      const response = await orderService.getMyActiveOrder();

      if (!response) {
        toast.error('Something went wrong. Please try again!');
        setHasActiveOrder(false);
        return;
      }

      if (response && response.error) {
        setHasActiveOrder(false);
        return;
      }

      setActiveOrder(response);
      setHasActiveOrder(true);
      if (response.isDelayedSubscription) {
        setSubscriptionManagementAvailableDate(
          new Date(response.startDate).toISOString().split('T')[0]
        );
      } else {
        setSubscriptionManagementAvailableDate(null);
      }
    };

    fetchActiveOrder();
  }, []);

  useEffect(() => {
    if (hasActiveOrder && activeOrder) {
      const mealIds = [
        activeOrder.mealOneId,
        activeOrder.mealTwoId,
        activeOrder.mealThreeId,
      ];

      const mealQuantities = mealIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});

      const activeOrderMealsWithQuantities = Object.entries(mealQuantities)
        .map(([mealId, quantity]) => {
          const mealDetail = meals.find((meal) => meal.id === parseInt(mealId));
          return mealDetail ? { meal: mealDetail, quantity } : null;
        })
        .filter((meal) => meal !== null);

      setSelectedMeals(activeOrderMealsWithQuantities);
      setSelectedSide(activeOrder.sideMeal);
    }
  }, [activeOrder, hasActiveOrder, meals]);

  useEffect(() => {
    const fetchMeals = async () => {
      const response = await mealService.getAllMeals();

      if (!response) {
        toast.error('Something went wrong. Please try again!');
        return;
      }

      if (response && response.error) {
        toast.error(response.error);
        return;
      }

      setMeals(response);
    };

    fetchMeals();
  }, []);

  const adjustMealQuantity = (mealToAdjust, increment = true) => {
    setSelectedMeals((currentSelectedMeals) => {
      const existingMealIndex = currentSelectedMeals.findIndex(
        (meal) => meal.meal.id === mealToAdjust.id
      );
      const existingMeal = currentSelectedMeals[existingMealIndex];

      let totalSelectedMeals = currentSelectedMeals.reduce(
        (total, { quantity }) => total + quantity,
        increment ? 1 : -1
      );

      if (increment && totalSelectedMeals > 3) {
        toast.error('You cannot select more than 3 meals in total.');
        return currentSelectedMeals;
      }

      totalSelectedMeals = Math.max(totalSelectedMeals, 0);

      if (existingMeal) {
        if (increment && totalSelectedMeals <= 3) {
          const updatedMeals = [...currentSelectedMeals];
          updatedMeals[existingMealIndex] = {
            ...existingMeal,
            quantity: existingMeal.quantity + 1,
          };
          return updatedMeals;
        } else if (!increment) {
          if (existingMeal.quantity > 1) {
            const updatedMeals = [...currentSelectedMeals];
            updatedMeals[existingMealIndex] = {
              ...existingMeal,
              quantity: existingMeal.quantity - 1,
            };
            return updatedMeals;
          } else {
            return currentSelectedMeals.filter(
              (_, index) => index !== existingMealIndex
            );
          }
        }
      } else if (increment && totalSelectedMeals <= 3) {
        return [...currentSelectedMeals, { meal: mealToAdjust, quantity: 1 }];
      }
      return currentSelectedMeals;
    });
  };

  const deleteMeal = (indexToDelete) => {
    setSelectedMeals((current) =>
      current.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleApartmentNumberChange = (event) => {
    setApartmentNumber(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    let flattenedMealIds = [];
    selectedMeals.forEach((meal) => {
      for (let i = 0; i < meal.quantity; i++) {
        flattenedMealIds.push(meal.meal.id);
      }
    });

    if (flattenedMealIds.length !== 3) {
      toast.error('Please select exactly 3 meals.');
      setIsLoading(false);
      return;
    }

    if (!selectedSide) {
      toast.error('Please select a side meal for your order.');
      setIsLoading(false);
      return;
    }

    if (!address || !apartmentNumber) {
      toast.error('Please fill in both address and apartment number.');
      setIsLoading(false);
      return;
    }

    const payload = {
      mealOneId: flattenedMealIds[0],
      mealTwoId: flattenedMealIds[1],
      mealThreeId: flattenedMealIds[2],
      sideMeal: selectedSide,
      address: address,
      appartmentNumber: apartmentNumber,
      totalPrice: selectedMeals.reduce(
        (total, meal) => total + parseFloat(meal.meal.price) * meal.quantity,
        0
      ),
    };

    const response = await orderService.createOrder(payload);

    if (!response) {
      toast.error('Something went wrong. Please try again!');
      setIsLoading(false);
      return;
    }

    if (response && response.error) {
      toast.error(response.error);
      setIsLoading(false);
      return;
    }

    if (response.stripeURL) {
      toast.success(
        'Order placed successfully! Please wait while we proceed you to the payment page.'
      );
      window.location.href = response.stripeURL;
    } else {
      toast.success('Order placed successfully!');
    }
  };

  const manageSubscription = async () => {
    setIsLoading(true);

    if (!user.isSubscribed && !hasActiveOrder) {
      toast.error(`You don't have any active subscription`);
      setIsLoading(false);
      return;
    }

    const response = await subscriptionService.createCustomerPortalSession();

    if (!response) {
      toast.error('Something went wrong. Please try again!');
      setIsLoading(false);
      return;
    }

    if (response && response.error) {
      toast.error(response.error);
      setIsLoading(false);
      return;
    }

    window.location.href = response.customerPortalURL;
  };

  const isDateInThisWeek = (date) => {
    const now = new Date();
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    const dateToCheck = new Date(date);

    return dateToCheck >= firstDayOfWeek && dateToCheck <= lastDayOfWeek;
  };

  const manageSubscriptionDisabled = useCallback(() => {
    if (subscriptionManagementAvailableDate) {
      const currentDateUTC = new Date(new Date().toUTCString().slice(0, -4));
      const availableDateUTC = new Date(
        subscriptionManagementAvailableDate + 'T00:00:00Z'
      );
      return currentDateUTC < availableDateUTC;
    }
    return false;
  }, [subscriptionManagementAvailableDate]);

  return (
    <div className='buy-container'>
      <nav className='buy-navigation'>
        <span className='logo-image' onClick={() => navigate('/')}></span>
        <div>
          {user?.user.is_admin && (
            <button onClick={() => navigate('/dashboard')}>Admin Panel</button>
          )}
          <button onClick={() => navigate('/home')}>Home</button>
          <button onClick={() => navigate('/buy')}>Buy</button>
        </div>
      </nav>

      <div className='buy-tagline-section'>
        <h1>3 Meals, 30 Bucks...</h1>
        <p>
          We standardize our meal pricing to make your selection process easier.
          Just pick your three favorite meals, your side choice and you’re set
          for the week.
          <br />
          <br />
          <br />
          If you would like to freeze or terminate your subscription at anytime,
          please reach out to us at  shadi@swishrobotics.com. If you don’t specifiy
          your meals for a given week, the subscription will automically redo
          your order from the week before.
        </p>
      </div>

      <div className='custom-dropdown'>
        <div className='dropdown-selected'>Select a Meal</div>
      </div>

      <div className='meal-cards-container'>
        {meals.map((meal, index) => (
          <div className='meal-card' key={index}>
            <div className='meal-card-content'>
              <img
                src={`${apiHost}/${meal.image}`}
                alt='Meal'
                style={{ width: '100px', height: '100px' }}
              />
              <div className='meal-info'>
                <h3>
                  {meal.protein} ({meal.code})
                </h3>
                <p>${parseFloat(meal.price).toFixed(2)}</p>
                {isDateInThisWeek(meal.createdAt) && (
                  <span className='recommended-label'>Meal of the Week</span>
                )}
                {!hasActiveOrder && (
                  <div className='meal-quantity-controls'>
                    <IoRemove onClick={() => adjustMealQuantity(meal, false)} />
                    <span>
                      {selectedMeals.find(
                        (selectedMeal) => selectedMeal.meal.id === meal.id
                      )?.quantity || 0}
                    </span>
                    <IoAdd onClick={() => adjustMealQuantity(meal, true)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='order-content'>
        <div className='meal-selection'>
          <h2>Pick Your Meals</h2>
          <div className='side-dish-container'>
            {sideDishes.map((sideDish) => (
              <div
                key={sideDish.value}
                className={`side-dish-card ${
                  selectedSide === sideDish.value ? 'selected' : ''
                }`}
                onClick={() => setSelectedSide(sideDish.value)}
              >
                <p>{sideDish.label}</p>
                <div
                  className={`toggle-switch ${
                    selectedSide === sideDish.value ? 'on' : ''
                  }`}
                ></div>
              </div>
            ))}
          </div>

          {selectedMeals.map((meal, index) => (
            <div className='meal' key={index}>
              <div className='photo-placeholder'>
                <img
                  src={`${apiHost}/${meal.meal.image}`}
                  alt='Meal'
                  style={{ width: '100px', height: '100px' }}
                />
              </div>
              <div className='meal-description'>
                <h3>
                  Meal {index + 1} ({meal.meal.protein} - {meal.meal.code}) x{' '}
                  {meal.quantity}
                </h3>
                <p>{meal.meal.description}</p>
              </div>
              {!hasActiveOrder && (
                <div>
                  <IoTrashBin
                    className='delete-meal'
                    onClick={() => deleteMeal(index)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='bill-section'>
          <h2>Your Bill</h2>
          {selectedMeals.map((meal, index) => (
            <div className='bill-item' key={index}>
              <span>
                Meal {index + 1} ({meal.meal.protein} - {meal.meal.code}) x{' '}
                {meal.quantity}
              </span>
              <span>
                ${(parseFloat(meal.meal.price) * meal.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className='bill-total'>
            <strong>Total</strong>
            <strong>
              $
              {selectedMeals
                .reduce(
                  (total, meal) =>
                    total + parseFloat(meal.meal.price) * meal.quantity,
                  0
                )
                .toFixed(2)}
            </strong>
          </div>
          <div className='input-field'>
            <label htmlFor='address'>Address:</label>
            <textarea
              type='text'
              id='address'
              name='address'
              rows={5}
              cols={60}
              value={hasActiveOrder ? activeOrder?.address : address}
              onChange={handleAddressChange}
              placeholder='Enter your address'
              disabled={hasActiveOrder}
            />
          </div>
          <div className='input-field'>
            <label htmlFor='apartmentNumber'>Apartment Number:</label>
            <input
              type='text'
              id='apartmentNumber'
              name='apartmentNumber'
              value={
                hasActiveOrder ? activeOrder.appartmentNumber : apartmentNumber
              }
              onChange={handleApartmentNumberChange}
              placeholder='Enter your apartment number'
              disabled={hasActiveOrder}
            />
          </div>
          <button
            className='continue-button'
            onClick={handleSubmit}
            disabled={isLoading || hasActiveOrder}
          >
            {hasActiveOrder
              ? `You already have an active subscription`
              : `Continue`}
          </button>
          {(user?.user.isSubscribed || hasActiveOrder) && (
            <button
              className='manage-subscription-button'
              onClick={manageSubscription}
              disabled={isLoading || manageSubscriptionDisabled()}
            >
              Manage Subscription
            </button>
          )}
          {subscriptionManagementAvailableDate &&
            manageSubscriptionDisabled() && (
              <p className='subscription-delay-message'>
                Subscription management will be available after{' '}
                {new Date(
                  subscriptionManagementAvailableDate
                ).toLocaleDateString()}
                .
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

export default OrderScreen;
