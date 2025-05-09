from flask import Flask, jsonify
from flask_cors import CORS
from myapp.utils import fetch_league_data, fetch_league_fixtures, match_xg_data


# app instance
app = Flask(__name__)
CORS(app)

@app.route("/api/fixtures", methods=['GET'])
async def get_upcoming_fixtures():
    
    league_data = await fetch_league_data()
    teams_fixtures = await fetch_league_fixtures()
    print(teams_fixtures)
    updated_fixtures = match_xg_data(teams_fixtures, league_data)
    
    return jsonify(updated_fixtures)


if __name__ == "__main__":
    app.run(debug="True", port=8080)
