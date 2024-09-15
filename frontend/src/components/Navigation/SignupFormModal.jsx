/** src/components/Navigation/SignupFormModal.jsx - Modal Component
 ** Renders the modal form that allows a signup.
 ** Note: Uses Modal.css for formatting. Any unique rules would be in Navigation.css
 *  TODO (Optional): Create an iterator that can create the inputs. Could save a lot of lines
*/

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';

/* No Component Props */
export default function SignupFormModal() {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  /** Determine whether or not to disable the submission button. Checks include:
   *  1: All fields must be populated.
   *  2: The Username must be at least 4 characters long.
   *  3: The Password (and Confirm Password by extension) must be at least 6 characters long.
  */
  useEffect(() => setDisabled(
    !firstName || !lastName || !email ||
    username?.length < 4 ||
    password?.length < 6 ||
    confirmPassword?.length < 6
  ), [firstName, lastName, email, username, password, confirmPassword]);

  // Dispatch the login attempt and close the modal. If errors are found, the modal will remain open.
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Custom Error Check: Password & Confirm Password must have the same contents
    if(password !== confirmPassword) return setErrors({
      confirmPassword: 'Confirm Password field must be the same as the Password field'
    })

    return dispatch(sessionActions.signup({
      email,
      username,
      firstName,
      lastName,
      password
    }))
    .then(closeModal)
    .catch(async (res) => {
      const data = await res.json();
      if (data?.errors) setErrors(data.errors);
      else if(data?.message) setErrors(data);
    })
  };

  return (<>
    {/* Modal Title */}
    <h1 className='modal-title'>Sign Up</h1>

    {/* Modal Form - to fill in new User details. All fields are Single-Line Text inputs */}
    <form className='modal-form' onSubmit={handleSubmit}>
      {/* Error Handling */}
      {errors.firstName && <p className='modal-form__error'>{errors.firstName}</p>}
      {errors.lastName && <p className='modal-form__error'>{errors.lastName}</p>}
      {errors.email && <p className='modal-form__error'>{errors.email}</p>}
      {errors.username && <p className='modal-form__error'>{errors.username}</p>}
      {errors.password && <p className='modal-form__error'>{errors.password}</p>}
      {errors.confirmPassword && <p className='modal-form__error'>{errors.confirmPassword}</p>}

      {/* First & Last Name */}
      <input 
        type='text' 
        placeholder='First Name' 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)} 
        required
      />
      <input 
        type='text' 
        placeholder='Last Name' 
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)} 
        required 
      />

      {/* Email & Username */}
      <input 
        type='text' 
        placeholder='Email' 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type='text' 
        placeholder='Username' 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        required 
      />

      {/* Password & Confirm Password */}
      <input 
        type='password' 
        placeholder='Password' 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      <input 
        type='password' 
        placeholder='Confirm Password' 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
        required 
      />

      {/* Submit Button - disabled unless requirements (described above) are met */}
      <button 
        className='modal-form__button' 
        type='submit' 
        disabled={disabled}
      >Sign Up</button>
    </form>
  </>)
}