# fpl-project

PROJECT OVERVIEW
Improvement of the Fantasy Premier League 'Fixture Difficulty Rating' page.

Allows the user to view detailed expected goals data of their opponents for any 
chosen remaining gameweeks of the season.

FEATURES/TECHNOLOGIES
Built upon the 'understat' python package, which scrapes the data available from
understat.com to return fixtures and team data for the current PL season

'server' --> Flask backend API which fetches and handles the raw data 
            Hosted on render.com

'client' --> NextJS React frontend which fetches the data from the API and displays
                it on a webpage
            Hosted using Vercel

USAGE 
User is able to select which of the remaining gameweeks of the season they wish to display in the table.
User can also select whether they want to display data from an attacking or defensive perspective
The final column displays either opponents' xG (for defense) or xGA (attack). 
This column has a sort so the fixtures can be viewed from best-worst or vice versa.
