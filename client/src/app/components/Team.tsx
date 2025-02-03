'use client';

import { useEffect, useState } from 'react';

type TeamProps = {
    fixtures: any[]
}

/* 
mapping over fixtures gives me access to the fixtures array of each team
each of those array entries is a dictionary of key:value pairs 
contains: gameweek, home_away, opponent, opponent_short, xG, xGA
*/ 

const Team = ({fixtures}: TeamProps) => {

    Object.entries(fixtures).map(([team, teamFixtures]: [string, any[]]) => {


        return
    })

    return (
        null
    )
}