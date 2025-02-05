import {useState} from "react";

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
  fixtures: Fixtures
  total_opponent_xG: string
  total_opponent_xGA: string
}

interface FixturesTableProps {
  updatedFixtures: UpdatedFixtures;
  gw_array: number[];
  maxGw: number;
  minGw: number;
  isAttack: boolean;
}


const FixturesTable: React.FC<FixturesTableProps> = ({ updatedFixtures, gw_array, maxGw, minGw, isAttack }) => {
  
  const [sortBy, setSortBy] = useState<"xG" | "xGA">("xG"); // Default sorting by xG
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Default descending

  // Function to handle sorting toggle
  const handleSort = (metric: "xG" | "xGA") => {
    if (sortBy === metric) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle order if same column is clicked
    } else {
      setSortBy(metric);
      setSortOrder("desc"); // Default to descending when changing metric
    }
  };

  // Sort updatedFixtures before rendering
  const sortedTeams = Object.entries(updatedFixtures).sort(([, a], [, b]) => {
    const valueA = parseFloat(sortBy === "xG" ? a.total_opponent_xG : a.total_opponent_xGA);
    const valueB = parseFloat(sortBy === "xG" ? b.total_opponent_xG : b.total_opponent_xGA);

    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });
  console.log(sortedTeams)

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-separate border border-gray-300 border-spacing-4">
        {/* Table Headers */}
        <thead>
          <tr>
            <th className="bg-green-800 border border-gray-300 rounded-md px-4 py-2 w-[150px] text-center">Team</th>
            {/* Generate columns for each gameweek in gw_array up to a certain number (including duplicates) */}
            {gw_array
              .filter((gw) => gw <= maxGw && gw >= minGw) // Only include gameweeks between the max and min
              .map((gw, index) => (
                <th key={index} className="border rounded-md border-gray-300 px-4 py-2 w-[120px] text-center">
                  GW {gw}
                </th>
              ))
            }
            
            {/* Total xG & xGA Columns */}
            {isAttack ? (
              <th
                className="border rounded-md border-gray-300 px-4 py-2 w-[160px] text-center cursor-pointer"
                onClick={() => handleSort("xGA")}
              >
                Opponent xGA {sortBy === "xGA" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            ) : (
              <th
                className="border rounded-md border-gray-300 px-4 py-2 w-[160px] text-center cursor-pointer"
                onClick={() => handleSort("xG")}
              >
                Opponent xG {sortBy === "xG" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            )}
            
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map(([team, { fixtures, total_opponent_xG, total_opponent_xGA }]) => {
            const teamFixturesClone = [...fixtures]; // Clone to manage double gameweeks

            return (
              <tr key={team}>
                {/* Team Name */}
                <td className="border rounded-md border-gray-300 px-4 py-2 font-bold">{team}</td>

                {/* Gameweek Fixtures */}
                {gw_array
                  .filter((gw) => gw <= maxGw && gw >= minGw)
                  .map((gw, index) => {
                    // Get all fixtures for the current gameweek
                    const fixturesForGW = teamFixturesClone.filter((fixture) => fixture.gameweek === gw);

                    // If the next gw_array value is the same, shift the clone to show second fixture later
                    if (gw_array[index + 1] === gw) {
                      teamFixturesClone.shift();
                    }

                    return (
                      <td key={index} className="border rounded-md px-4 py-2 text-center">
                        {fixturesForGW.length > 0 ? (
                          <>
                            <div>{fixturesForGW[0].opponent_short} ({fixturesForGW[0].home_away})</div>
                            <div className="text-sm text-gray-500">xG: {fixturesForGW[0].xG}</div>
                            <div className="text-sm text-gray-500">xGA: {fixturesForGW[0].xGA}</div>
                          </>
                        ) : (
                          <div className="text-gray-400">-</div> // Empty cell for no fixture
                        )}
                      </td>
                    );
                  })}
                {/* Total xG & xGA Columns */}
                {!isAttack ? (
                  <td className="border rounded-md px-4 py-2 text-center font-bold">{total_opponent_xG}</td>
                ) : (
                  <td className="border rounded-md px-4 py-2 text-center font-bold">{total_opponent_xGA}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FixturesTable;
