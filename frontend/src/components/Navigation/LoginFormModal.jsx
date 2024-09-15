/** src/components/Navigation/LoginFormModal.jsx - Modal Component
 ** Renders the modal form that allows a login. Also permits a demo login.
 ** Note: Uses Modal.css for formatting. Any unique rules would be in Navigation.css
*/

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';

/* No Component Props */
export default function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    // Dispatch a demo login and close the modal.
    const demoLogin = () => dispatch(sessionActions.login({ 
        credential: 'Demo-lition', 
        password: 'password' 
    })).then(closeModal);

    /** Determine whether or not to disable the submission button. Checks include:
     *  1: Both fields must be populated.
     *  2: The Username must be at least 4 characters long.
     *  3: The Password must be at least 6 characters long.
    */
    useEffect(() => setDisabled(
        credential?.length < 4 || 
        password?.length < 6
    ), [credential, password]);

    // Dispatch the login attempt and close the modal. If errors are found, the modal will remain open.
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.login({ credential, password }))
        .then(closeModal)
        .catch(async (res) => {
            const data = await res.json();
            if(data?.errors) setErrors(data.errors);
            else if(data?.message) setErrors(data);
        });
    }

    return (<>
        {/* Modal Title */}
        <h1 className='modal-title'>Log In</h1>

        {/* Modal Form - to fill in credentials */}
        <form className='modal-form' onSubmit={handleSubmit}>
            {/* Error Handling */}
            {errors.credential && <p className='modal-form__error'>{errors.credential}</p>}
            {errors.password && <p className='modal-form__error'>{errors.password}</p>}
            {errors.message && <p className='modal-form__error'>{errors.message}</p>}

            {/* Username/Email Single-Line Text Input */}
            <input 
                type='text' 
                placeholder='Username or Email' 
                value={credential} 
                onChange={(e) => setCredential(e.target.value)} 
                required 
            />

            {/* Password Single-Line Text Input */}
            <input 
                type='password' 
                placeholder='Password' 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />

            {/* Submit Button - disabled unless requirements (described above) are met */}
            <button 
                className='modal-form__button' 
                type='submit' 
                disabled={disabled}
            >Log In</button>
        </form>

        {/* Demo Login Button - has no credential requirement */}
        <button className='modal-button' onClick={demoLogin}>Log In as Demo User</button>
    </>);
}