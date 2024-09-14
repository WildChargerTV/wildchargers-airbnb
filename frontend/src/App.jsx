import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import CreateSpotForm from './components/CreateSpotForm';
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
          element: <CreateSpotForm />
        },
        {
          path: ':spotId',
          element: <SpotDetails />,
          children: [
            {
              path: 'edit',
            }
          ]
        }
      ]
    }
  ]
}]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;