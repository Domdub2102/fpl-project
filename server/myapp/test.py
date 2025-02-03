from collections import defaultdict
import aiohttp, asyncio
from understat import Understat 
import json
from datetime import datetime
from pandas import DataFrame

async def main():
    # fetches xg and xga data from understat
    try:
        async with aiohttp.ClientSession() as session:
            understat = Understat(session)
            league_table = await understat.get_league_table(
                "epl", 
                2025,
                True,
            )

            # extracts column headings
            columns = league_table[0]

            team_index = columns.index("Team")
            matches_index = columns.index("M")
            xG_index = columns.index("xG")
            xGA_index = columns.index("xGA")
            
            league_data = []
            xG_rank = []
            xGA_rank = []

            for row in league_table[1:]:
                team = row[team_index]
                xGper90 = round(row[xG_index] / row[matches_index], 2)
                xGAper90 = round(row[xGA_index] / row[matches_index], 2)

                xG_rank.append({
                    "xGper90": xGper90
                })

                xGA_rank.append({
                    "xGAper90": xGAper90
                })
                
                league_data.append({
                    "team": team,
                    "xGper90": float(f"{xGper90:.2f}"),
                    "xGAper90": float(f"{xGAper90:.2f}"),
                    "xGrank": None,
                    "xGArank": None
                })

            # Sorts league_data array by xG and xGA and assigns ranks to each team
            sorted_league_data = sorted(league_data, key=lambda team: team["xGper90"], reverse=True)
            for index, team in enumerate(sorted_league_data, start=1):
                team["xGrank"] = index
            
            sorted_league_data = sorted(league_data, key=lambda team: team["xGAper90"])
            for index, team in enumerate(sorted_league_data, start=1):
                team["xGArank"] = index            

            return sorted_league_data
    
    except Exception as e:
        print(f"Error fetching league data: {e}")
        return []


asyncio.run(main())
