from collections import defaultdict
import aiohttp, asyncio
from understat import Understat 
import json
from datetime import datetime

GAMEWEEK_DATES = [
    {"gw": 24, "start": "2025-02-01", "end": "2025-02-12"},
    {"gw": 25, "start": "2025-02-14", "end": "2025-02-16"},
    {"gw": 26, "start": "2025-02-21", "end": "2025-02-23"},
    {"gw": 27, "start": "2025-02-25", "end": "2025-02-27"},
    {"gw": 28, "start": "2025-03-08", "end": "2025-03-10"},
    {"gw": 29, "start": "2025-03-15", "end": "2025-03-16"},
    {"gw": 30, "start": "2025-04-01", "end": "2025-04-02"},
    {"gw": 31, "start": "2025-04-05", "end": "2025-04-11"},
    {"gw": 32, "start": "2025-04-12", "end": "2025-04-18"},
    {"gw": 33, "start": "2025-04-19", "end": "2025-04-25"},
    {"gw": 34, "start": "2025-04-26", "end": "2025-05-02"},
    {"gw": 35, "start": "2025-05-03", "end": "2025-05-09"},
    {"gw": 36, "start": "2025-05-10", "end": "2025-05-17"},
    {"gw": 37, "start": "2025-05-18", "end": "2025-05-24"},
    {"gw": 38, "start": "2025-05-25", "end": "2025-05-26"},
]



def assign_gameweek_to_fixtures(fixtures):
    for fixture in fixtures:
        # Check if datetime exists and is in correct format
        if "datetime" in fixture:
            try:
                fixture_date = datetime.strptime(fixture["datetime"], "%Y-%m-%d %H:%M:%S")
            except ValueError as e:
                print(f"Invalid datetime format for fixture: {fixture['datetime']} - Error: {e}")
                continue  # Skip this fixture if the date is invalid
        else:
            print(f"Missing datetime for fixture: {fixture}")
            continue  # Skip if no datetime field exists


        # Assign gameweek based on the fixture date
        gameweek_assigned = False
        for gw in GAMEWEEK_DATES:
            start = datetime.strptime(gw["start"], "%Y-%m-%d")
            end = datetime.strptime(gw["end"], "%Y-%m-%d")
            print(f"start: {start}")
            print(f"fixture date: {fixture_date}")
            print(f" end: {end}")
            if start <= fixture_date <= end:
                fixture["gameweek"] = gw["gw"]
                gameweek_assigned = True
                break

        # If no gameweek was assigned, print the fixture for debugging
        if not gameweek_assigned:
            print(f"No gameweek assigned for fixture: {fixture['datetime']}")
            continue

    return fixtures



async def main():
    try:
        async with aiohttp.ClientSession() as session:
            understat = Understat(session)
            fixtures = await understat.get_league_fixtures(
                "epl",
                2025,
            )

            fixtures = assign_gameweek(fixtures)

            teams_fixtures = defaultdict(list)

            for fixture in fixtures:
                # Extract relevant data for the home team
                home_team = fixture["h"]["title"]
                home_fixture = {
                    "opponent": fixture["a"]["title"],
                    "opponent_short": fixture["a"]["short_title"],
                    "home_away": "H",
                    "gameweek": fixture["gameweek"]
                }
                teams_fixtures[home_team].append(home_fixture)

                # Extract relevant data for the away team
                away_team = fixture["a"]["title"]
                away_fixture = {
                    "opponent": fixture["h"]["title"],
                    "opponent_short": fixture["h"]["short_title"],
                    "home_away": "A",
                    "gameweek": fixture["gameweek"]
                }
                teams_fixtures[away_team].append(away_fixture)
            return teams_fixtures
        
            
    except Exception as e:
        print(f"Error fetching fixtures: {e}")


asyncio.run(main())
        