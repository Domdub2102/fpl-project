import {useState} from "react";

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

interface UpdatedFixtures {
  [team: string]: {
    fixtures: Fixture[];
    total_opponent_xG: string;
    total_opponent_xGA: string;
  }
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

  return (
    <div className="border border-gray-500 rounded-md mx-10">
      <div className="overflow-x-auto w-full">
        <table className="w-full table-auto border-separate border-spacing-4">
          {/* Table Headers */}
          <thead>
            <tr>
              <th className="min-w-[180px] bg-black sticky left-0 text-center"></th>
              {/* Generate columns for each gameweek in gw_array up to a certain number (including duplicates) */}
              {gw_array
                .filter((gw) => gw <= maxGw && gw >= minGw) // Only include gameweeks between the max and min
                .map((gw, index) => (
                  <th key={index} className="min-w-[110px] px-4 py-2 text-center">
                    GW {gw}
                  </th>
                ))
              }
              
              {/* Total xG & xGA Columns */}
              {isAttack ? (
                <th
                  className="min-w-[210px] px-4 py-2 text-center text-white cursor-pointer sticky right-0 bg-black"
                  onClick={() => handleSort("xGA")}
                >
                  Opponent xGA Total {sortBy === "xGA" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
              ) : (
                <th
                  className="min-w-[210px] px-4 py-2 text-center text-white cursor-pointer sticky right-0 bg-black"
                  onClick={() => handleSort("xG")}
                >
                  Opponent xG Total {sortBy === "xG" && (sortOrder === "asc" ? "↑" : "↓")}
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
                  <td className="px-5 h-[80px] text-lg font-bold sticky left-0 text-white bg-black">{team}</td>

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
                      
                      // Function to determine background color based on rank
                      const getBgColor = (rank: number) => {
                        if (rank >= 1 && rank <= 4) return "bg-red-700 text-white"; // Dark Red
                        if (rank >= 5 && rank <= 8) return "bg-red-400 text-black"; // Light Red
                        if (rank >= 9 && rank <= 12) return "bg-gray-300 text-black"; // Grey
                        if (rank >= 13 && rank <= 16) return "bg-green-300 text-black"; // Light Green
                        if (rank >= 17 && rank <= 20) return "bg-green-700 text-white"; // Dark Green
                        else return "";
                      };

                      return (
                        <td
                          key={index}
                          className={`border-none rounded-md px-4 py-2 text-center ${
                            fixturesForGW.length > 0 ?
                              getBgColor(isAttack ? fixturesForGW[0].xGArank : fixturesForGW[0].xGrank) :
                              ""
                          }`}
                        >
                          {fixturesForGW.length > 0 ? (
                            <>
                              <div className="text-lg font-bold">{fixturesForGW[0].opponent_short} ({fixturesForGW[0].home_away})</div>
                              {isAttack ?
                                <div className="text-xs text-black">xGA: {fixturesForGW[0].xGA}</div> :
                                <div className="text-xs text-black">xG: {fixturesForGW[0].xG}</div>
                              }
                            </>
                          ) : (
                            <div className="text-white">-</div> // Empty cell for no fixture
                          )}
                        </td>
                      );
                    })
                  }
                  {/* Total xG & xGA Columns */}
                  {!isAttack ? (
                    <td className="px-4 py-2 text-center text-white text-lg font-bold sticky right-0 bg-black">{total_opponent_xG}</td>
                  ) : (
                    <td className="px-4 py-2 text-center text-white text-lg font-bold sticky right-0 bg-black">{total_opponent_xGA}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixturesTable;
