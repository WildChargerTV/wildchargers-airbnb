import { useState, useEffect, useRef } from 'react';
import { MdAccountCircle, MdDehaze } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import LoginFormModal from '../LoginFormModal';
import OpenModalMenuItem from './OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal';
import * as sessionActions from '../../store/session';

const ProfileButton = ({ user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ulRef = useRef();
    const [showMenu, setShowMenu] = useState(false);
    
    const closeMenu = () => setShowMenu(false);
    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
        closeMenu();
        navigate('/');
    }
    const toggleMenu = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    }

    useEffect(() => {
        if(!showMenu) return;
        const closeMenu = (e) => { 
            if(!ulRef.current.contains(e.target)) setShowMenu(false);
        }
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [showMenu]);

    const ulClassName = 'site-profile__dropdown' + (showMenu ? '' : ' hidden');
    return (
        <div id='site-profile'>
            <div id='site-profile__btn-container'>
                <button className='profile-btn' onClick={toggleMenu}><MdDehaze /></button>
                <button className='profile-btn' onClick={toggleMenu}><MdAccountCircle /></button>
            </div>
            <ul className={ulClassName} ref={ulRef}>
                {user ? (<>
                    <li>Hello, {user.firstName}</li>
                    <li id='dropdown-email'>{user.email}</li>
                    <li id='dropdown-manage-spots'><NavLink to='/spots/current'>Manage Spots</NavLink></li>
                    <li><button id='dropdown-logout' onClick={logout}>Log Out</button></li>
                </>) : (<>
                    <OpenModalMenuItem itemText='Log In' onItemClick={closeMenu} modalComponent={<LoginFormModal />} />
                    <OpenModalMenuItem itemText='Sign Up' onItemClick={closeMenu} modalComponent={<SignupFormModal />} />
                </>)}
            </ul>
        </div>
    )
}

export default ProfileButton;