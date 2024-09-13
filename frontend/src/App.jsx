import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Navigation from './components/Navigation';
import SpotDetails from './components/SpotDetails';
import SpotList from './components/SpotList';
import * as sessionActions from './store/session';
import './fonts/kenyaNewRodinProNEB.woff';
import './fonts/kenyaSouthSide.woff';
import './fonts/MontserratExtraBold.woff2';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => { setIsLoaded(true) });
  }, [dispatch]);
  
  return (<>
    <Navigation isLoaded={isLoaded} />
    {isLoaded && <Outlet />}
  </>)
}

const router = createBrowserRouter([{
  element: <Layout />,
  children: [
    { 
      path: '/', 
      element: <SpotList /> 
    },
    {
      path: '/spots',
      children: [
        {
          path: 'current',

        },
        {
          path: 'new',

        },
        {
          path: ':spotId',
          element: <SpotDetails />
        }
      ]
    }
  ]
}]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;