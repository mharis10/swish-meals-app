import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { IoIosAdd, IoIosCreate, IoIosTrash } from 'react-icons/io';
import SideNavBar from './SideNavBar';
import mealService from '../services/meal-service';
import toast from 'react-hot-toast';
import { apiHost } from '../services/host';

Modal.setAppElement('#root');

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentMeal, setCurrentMeal] = useState(null);
  const [modalType, setModalType] = useState('');
  const [mealFormData, setMealFormData] = useState({
    id: null,
    code: '',
    protein: '',
    price: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

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

  const openModal = (type, meal = null) => {
    setModalType(type);
    setCurrentMeal(meal);
    if (meal) {
      setMealFormData(meal);
    } else {
      setMealFormData({
        id: null,
        code: '',
        protein: '',
        price: '',
      });
    }
    setModalIsOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMealFormData((prevState) => ({
        ...prevState,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalType === 'create') {
      const formData = new FormData();
      formData.append('code', mealFormData.code);
      formData.append('protein', mealFormData.protein);
      formData.append('price', mealFormData.price);
      formData.append('image', mealFormData.image);

      const response = await mealService.createMeal(formData);

      if (!response) {
        toast.error('Something went wrong. Please try again!');
        return;
      }

      if (response && response.error) {
        toast.error(response.error);
        return;
      }

      setMeals([...meals, { ...response.meal }]);
      toast.success('Meal created successfully!');
    } else if (modalType === 'edit') {
      let payload = {
        code: mealFormData.code,
        protein: mealFormData.protein,
        price: mealFormData.price,
      };

      const response = await mealService.updateMeal(mealFormData.id, payload);

      if (!response) {
        toast.error('Something went wrong. Please try again!');
        return;
      }

      if (response && response.error) {
        toast.error(response.error);
        return;
      }

      setMeals(
        meals.map((meal) => (meal.id === mealFormData.id ? mealFormData : meal))
      );

      toast.success('Meal updated successfully!');
    }
    closeModal();
  };

  const handleDeleteConfirm = async () => {
    const response = await mealService.deleteMeal(currentMeal.id);

    if (!response) {
      toast.error('Something went wrong. Please try again!');
      return;
    }

    if (response && response.error) {
      toast.error(response.error);
      return;
    }

    setMeals(meals.filter((meal) => meal.id !== currentMeal.id));
    toast.success('Meal deleted successfully!');
    closeModal();
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType('');
    setCurrentMeal(null);
    setMealFormData({
      id: null,
      code: '',
      protein: '',
      price: '',
      image: null,
    });
    setImagePreview(null);
  };

  return (
    <div className='admin-panel'>
      <SideNavBar />
      <div className='meals-admin'>
        <div className='header'>
          <h2>Meals</h2>
          <button onClick={() => openModal('create')} className='create-button'>
            <IoIosAdd /> Create New Meal
          </button>
        </div>
        <table className='meals-table'>
          <thead>
            <tr>
              <th>Image</th>
              <th>Code</th>
              <th>Protein</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((meal) => (
              <tr key={meal.id}>
                <td>
                  <img
                    src={`${apiHost}/${meal.image}`}
                    alt='Meal'
                    style={{ width: '50px', height: '50px' }}
                  />
                </td>
                <td>{meal.code}</td>
                <td>{meal.protein}</td>
                <td>${meal.price}</td>
                <td className='actions'>
                  <button
                    onClick={() => openModal('edit', meal)}
                    className='edit-button'
                  >
                    <IoIosCreate />
                  </button>
                  <button
                    onClick={() => openModal('delete', meal)}
                    className='delete-button'
                  >
                    <IoIosTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className='meal-modal'
        >
          {modalType === 'delete' ? (
            <div className='meals-modal-content'>
              <h2>Delete Meal</h2>
              <p>Are you sure you want to delete this meal?</p>
              <button onClick={handleDeleteConfirm} className='confirm-delete'>
                Confirm
              </button>
              <button onClick={closeModal} className='cancel-button'>
                Cancel
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='modal-form'>
              <h2>
                {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Meal
              </h2>
              {modalType === 'create' && imagePreview && (
                <div className='form-group image-preview'>
                  <img
                    src={imagePreview}
                    alt='Preview'
                    style={{ width: '50%', maxHeight: '300px' }}
                  />
                </div>
              )}
              {modalType === 'create' && (
                <div className='form-group'>
                  <label>Image:</label>
                  <input
                    type='file'
                    name='image'
                    onChange={handleFileChange}
                    accept='image/png, image/jpeg'
                    required
                  />
                </div>
              )}
              <div className='form-group'>
                <label>Code:</label>
                <input
                  type='text'
                  name='code'
                  value={mealFormData.code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Protein:</label>
                <input
                  type='text'
                  name='protein'
                  value={mealFormData.protein}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Price:</label>
                <input
                  type='number'
                  name='price'
                  step='0.01'
                  value={mealFormData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='form-actions'>
                <button
                  type='submit'
                  className={
                    modalType === 'edit' ? 'update-button' : 'create-button'
                  }
                >
                  {modalType === 'edit' ? 'Update' : 'Create'}
                </button>
                <button
                  type='button'
                  onClick={closeModal}
                  className='cancel-button'
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Meals;
