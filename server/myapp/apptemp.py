from myapp.utils import fetch_league_data, fetch_league_fixtures, match_xg_data
import asyncio


async def main():
    
    # TO-DO: allow user input here
    searched_team = "Ipswich"

    league_data = await fetch_league_data()
    searched_team_fixtures = await fetch_league_fixtures(searched_team)

    upcoming_fixtures = match_xg_data(searched_team_fixtures, league_data)

    print(upcoming_fixtures)

    
asyncio.run(main())