import aiohttp
from understat import Understat 
from collections import defaultdict
from datetime import datetime

# mapping of gameweek ranges
GAMEWEEK_DATES = [
    {"gw": 24, "start": "2025-02-01", "end": "2025-02-13"},
    {"gw": 25, "start": "2025-02-14", "end": "2025-02-20"},
    {"gw": 26, "start": "2025-02-21", "end": "2025-02-24"},
    {"gw": 27, "start": "2025-02-25", "end": "2025-03-07"},
    {"gw": 28, "start": "2025-03-08", "end": "2025-03-14"},
    {"gw": 29, "start": "2025-03-15", "end": "2025-03-31"},
    {"gw": 30, "start": "2025-04-01", "end": "2025-04-04"},
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
            if start <= fixture_date <= end:
                fixture["gameweek"] = gw["gw"]
                gameweek_assigned = True
                break

        # If no gameweek was assigned, print the fixture for debugging
        if not gameweek_assigned:
            print(f"No gameweek assigned for fixture: {fixture['datetime']}")
            continue

    return fixtures


# fetches xg and xga data from the understat League Table
async def fetch_league_data():
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
                xGper90 = "%0.2f" % round(row[xG_index] / row[matches_index], 2)
                xGAper90 = "%0.2f" % round(row[xGA_index] / row[matches_index], 2)

                xG_rank.append({
                    "xGper90": xGper90
                })

                xGA_rank.append({
                    "xGAper90": xGAper90
                })
                
                league_data.append({
                    "team": team,
                    "xGper90": xGper90,
                    "xGAper90": xGAper90,
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



# need to add the datetime data to the fixture, then assign a gameweek key to each fixture based on that datetime
async def fetch_league_fixtures():
    try:
        async with aiohttp.ClientSession() as session:
            understat = Understat(session)
            fixtures = await understat.get_league_fixtures(
                "epl",
                2025,
            )            

            fixtures = assign_gameweek_to_fixtures(fixtures)
            if fixtures is None:
                print("assigned gameweek func returned none")

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
        

# finds the xg data of all teams in a list of upcoming fixtures
def match_xg_data(teams_fixtures, league_data):

    if teams_fixtures is None:
        raise ValueError("teams_fixtures cannot be None")
     
    # Create a dictionary for fast lookup of xG and xGA data
    team_xg_data = {
        team["team"]: {
            "xG": team["xGper90"], 
            "xGA": team["xGAper90"], 
            "xGrank": team["xGrank"], 
            "xGArank": team["xGArank"]
            } 
        for team in league_data
    }

    # Iterate through each team's fixtures
    for team, fixtures in teams_fixtures.items():
        for fixture in fixtures:
            opponent = fixture["opponent"]  # Get the opponent's name
            # Check if the opponent exists in the xG data
            if opponent in team_xg_data:
                # Add xG and xGA data for the opponent
                fixture["xG"] = team_xg_data[opponent]["xG"]
                fixture["xGA"] = team_xg_data[opponent]["xGA"]
                fixture["xGrank"] = team_xg_data[opponent]["xGrank"]
                fixture["xGArank"] = team_xg_data[opponent]["xGArank"]
            else:
                # Optionally, handle cases where xG data for the opponent is not found
                fixture["xG"] = None
                fixture["xGA"] = None

    return teams_fixtures
