type Fixture = {
    gameweek: number;
    home_away: string;
    opponent: string;
    opponent_short: string;
    xG: number;
    xGA: number;
  };

  type Fixtures = Record<string, Fixture[]>; 
  
  interface UpdatedFixtures {
    [team: string]: {
      fixtures: Fixture[];
      total_opponent_xG: string;
      total_opponent_xGA: string;
    }
  }


export function calculateUpdatedFixtures(
  fixtures: Fixtures,
  minGw: number,
  maxGw: number
): UpdatedFixtures {
  // Creating the updated fixtures object
  const updatedFixtures = Object.fromEntries(
    Object.entries(fixtures).map(([team, teamFixtures]) => {
      // Filter fixtures that fall within the gameweek range [minGw, maxGw]
      const filteredFixtures = teamFixtures.filter(
        (fixture) => fixture.gameweek >= minGw && fixture.gameweek <= maxGw
      );

      // Sum xG and xGA for the filtered fixtures
      const total_xG = filteredFixtures.reduce((sum, fixture) => sum + parseFloat(fixture.xG.toString()), 0);
      const total_xGA = filteredFixtures.reduce((sum, fixture) => sum + parseFloat(fixture.xGA.toString()), 0);

      // Return the updated fixture data for the team
      return [
        team, 
        {
          fixtures: filteredFixtures, // Include only the filtered fixtures
          total_opponent_xG: total_xG.toFixed(2), // Sum of xG for the selected gameweeks
          total_opponent_xGA: total_xGA.toFixed(2) // Sum of xGA for the selected gameweeks
        }
      ];
    })
  );
  
  return updatedFixtures;
}