'use client';

import { useEffect, useState } from 'react';
import ToggleButton from './components/ToggleButton';
import TableLengthSelector from './components/TableLengthSelector';
import FixturesTable from './components/FixturesTable';
import { calculateUpdatedFixtures, calculateMeanValues } from './utils/utils';

type Fixture = {
  gameweek: number;
  home_away: string;
  opponent: string;
  opponent_short: string;
  xG: number;
  xGA: number;
  xGrank: number;
  xGArank: number;
};

type Fixtures = Record<string, Fixture[]>; 


const HomePage = () => {
  const [fixtures, setFixtures] = useState<Fixtures>({}); // State to store the fixtures data
  const [loading, setLoading] = useState(true); // State for the loading status
  const [error, setError] = useState(''); // State for error messages
  const [isAttack, setIsAttack] = useState(true);
  const [gwArray, setGwArray] = useState<number[]>([]);
  const [minGw, setMinGw] = useState(0)
  const [maxGw, setMaxGw] = useState(0)
  

  useEffect(() => {
    fetch('https://fpl-project-f8gz.onrender.com/api/fixtures') // Update the endpoint if needed
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((data) => {
        setFixtures(data); // Assuming `data` contains the fixtures
        setLoading(false);
        const { length_of_table, gw_array } = Object.entries(data as Fixtures).reduce((acc, [, teamFixtures]) => {
          const gwCount = teamFixtures.length; // Get number of fixtures for this team
          
          // If this team has more fixtures than the previous max, update acc
          if (gwCount > acc.length_of_table) {
            acc.length_of_table = gwCount;
            acc.gw_array = teamFixtures.map((fixture: Fixture) => fixture.gameweek); // Extract the gameweek numbers
          }
          return acc;
        }, { length_of_table: 0, gw_array: [] as number[] }); // Initialize the accumulator with default values

        setMinGw(Math.min(...gw_array))
        setMaxGw(Math.max(...gw_array))
        setGwArray(gw_array)
        console.log(length_of_table)
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Loading fixtures...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  console.log(fixtures)


  const updatedFixtures = calculateUpdatedFixtures(fixtures, minGw, maxGw)

  const meanValues = calculateMeanValues(updatedFixtures)

  console.log(meanValues)

  // JSX for displaying the fixtures
  return (
    <div className="container flex flex-col mx-auto p-4 overflow-auto relative">

      <div className="flex items-center justify-between max-w-[800px] w-full mx-auto mb-10 pt-10">

        <h1 className="text-2xl font-bold text-center">
          FPL Fixture Difficulty
        </h1>

        <TableLengthSelector 
          minGw={minGw}
          maxGw={maxGw} 
          gwArray={gwArray} 
          setMinGw={setMinGw} 
          setMaxGw={setMaxGw}
        />
        
        <ToggleButton 
          isAttack={isAttack} 
          setIsAttack={setIsAttack}
        />
      </div>
  
      {/* Scrollable Table */}
      <div>
        <FixturesTable 
          updatedFixtures={updatedFixtures} 
          gw_array={gwArray} 
          minGw={minGw} 
          maxGw={maxGw}
          isAttack={isAttack}
        />
      </div>
    </div>
  );
  
};

export default HomePage;

