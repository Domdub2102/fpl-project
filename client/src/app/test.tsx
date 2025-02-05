const { length_of_table, gw_array } = Object.entries(data).reduce((acc, [_, teamFixtures]) => {
    const gwCount = teamFixtures.length; // Get number of fixtures for this team
    
    // If this team has more fixtures than the previous max, update acc
    if (gwCount > acc.length_of_table) {
      acc.length_of_table = gwCount;
      acc.gw_array = teamFixtures.map((fixture: Fixture) => fixture.gameweek); // Extract the gameweek numbers
    }
    return acc;
  }, { length_of_table: 0, gw_array: [] }); // Initialize the accumulator with default values