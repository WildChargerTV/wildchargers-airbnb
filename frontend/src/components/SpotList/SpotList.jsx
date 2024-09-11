import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SingleSpot from "./SingleSpot";
import { getSpots } from "../../store/spots";

function SpotList() {
    const dispatch = useDispatch();
    const allSpots = useSelector((state) => state.spot.Spots);

    useEffect(() => { dispatch(getSpots()) }, [dispatch]);

    return (<main id='spot-list'>
        {allSpots?.map((spot) => <SingleSpot key={spot.id} spot={spot} />)}
    </main>);
}

export default SpotList;