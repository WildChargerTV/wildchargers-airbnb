/** src/App.jsx
 ** This is the main visible component. Everything that can be rendered is either referenced here, or routes from here.
 ** Through App, the routing tree is established to lead to all the other pages on the website. Custom fonts are also imported here.
 *! It is not recommended to render anything beyond a header and a footer in this file. All other body components should be in the browser router.
 */

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import SpotForm from './components/SpotForm';
import Navigation from './components/Navigation';
import SpotDetails from './components/SpotDetails';
import SpotList from './components/SpotList';
import * as sessionActions from './store/session';
import './fonts/kenyaNewRodinProNEB.woff';
import './fonts/kenyaSouthSide.woff';
import './fonts/MontserratExtraBold.woff2';

/** Helper Component Layout
 ** Restores the current session User, and then gives Navigation the green light to load the Profile buttons.
 *  No Component Props
 */
function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore the current session User. Once dispatch is complete, set isLoaded to true.
  useEffect(() => {
    dispatch(sessionActions.restoreUser())
    .then(() => setIsLoaded(true));
  }, [dispatch]);
  
  return (<>
    {/* App Header */}
    <Navigation isLoaded={isLoaded} />

    {/* App Body & Route Outlet - renders only when session User is restored */}
    {isLoaded && <Outlet />}
  </>)
}

// This is the primary router directory. All routes are specified here.
const router = createBrowserRouter([{
  element: <Layout />,
  children: [
    { 
      path: '/', 
      element: <SpotList current={false} /> 
    },
    {
      path: '/spots',
      children: [
        {
          path: 'current',
          element: <SpotList current={true} />
        },
        {
          path: 'new',
          element: <SpotForm />
        },
        {
          path: ':spotId/edit',
          element: <SpotForm />
        },
        {
          path: ':spotId',
          element: <SpotDetails />
        }
      ]
    }
  ]
}]);

/* No Component Props */
export default function App() {
  return <RouterProvider router={router} />
}