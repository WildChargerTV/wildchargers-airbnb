import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';

function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const demoLogin = () => dispatch(sessionActions.login({ credential: 'Demo-lition', password: 'password' })).then(closeModal);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.login({ credential, password })).then(closeModal).catch(async (res) => {
            const data = await res.json();
            if(data?.errors) setErrors(data.errors);
            else if(data?.message) setErrors(data);
        });
    }

    return (<>
        <h1 className='modal-title'>Log In</h1>
        <form className='modal-form' onSubmit={handleSubmit}>
            {errors.credential && <p className='modal-form__error'>{errors.credential}</p>}
            {errors.password && <p className='modal-form__error'>{errors.password}</p>}
            {errors.message && <p className='modal-form__error'>{errors.message}</p>}
            <input type='text' placeholder='Username or Email' value={credential} onChange={(e) => setCredential(e.target.value)} required />
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type='submit'>Log In</button>
        </form>
        <button className='modal-button' onClick={demoLogin}>Log In as Demo User</button>
    </>);
}

export default LoginFormModal;
