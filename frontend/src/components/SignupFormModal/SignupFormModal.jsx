import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(sessionActions.signup({
        email,
        username,
        firstName,
        lastName,
        password
      })).then(closeModal).catch(async (res) => {
        const data = await res.json();
        if (data?.errors) {
          setErrors(data.errors);
        }
      })
    }
    return setErrors({
      confirmPassword: 'Confirm Password field must be the same as the Password field'
    });
};

  return (<>
    <h1 className='modal-title'>Sign Up</h1>
    <form className='modal-form' onSubmit={handleSubmit}>
      {errors.firstName && <p className='modal-form__error'>{errors.firstName}</p>}
      {errors.lastName && <p className='modal-form__error'>{errors.lastName}</p>}
      {errors.email && <p className='modal-form__error'>{errors.email}</p>}
      {errors.username && <p className='modal-form__error'>{errors.username}</p>}
      {errors.password && <p className='modal-form__error'>{errors.password}</p>}
      {errors.confirmPassword && <p className='modal-form__error'>{errors.confirmPassword}</p>}
      <input type='text' placeholder='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      <input type='text' placeholder='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      <input type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type='password' placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      <button type='submit'>Sign Up</button>
    </form>
  </>);
}

export default SignupFormModal;