#!/usr/bin/env node

/*

** Fetch current genres from prod **

curl "http://cms.atom.nbcuott.com/core/proposition/ref/genre" \                                                                                                                ✔  12:14:18
     -H 'X-SkyOTT-Territory: US' \
     -H 'X-SkyOTT-Language: en' \
     -H 'X-SkyOTT-Proposition: NBCUOTT' \
     -H 'X-SkyOTT-Device: MOBILE' \
     -H 'X-SkyOTT-Platform: IOS' \
     -H 'X-SkyOTT-ServiceToken: admin' \
     -H 'X-SkyOTT-Service: service-integration@pcms.uk' | jq -r .payload > /Users/tmu16/Development/ott-pcms/.ignored/apple-feeds/genres-[DATE].json

 */

const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const DATE = '10-03-22';

(async function () {

    const genresFile = `/Users/tmu16/Development/ott-pcms/.ignored/apple-feeds/genres-${DATE}.json`;
    const csvFile = `/Users/tmu16/Development/ott-pcms/.ignored/apple-feeds/apple-sle-map-${DATE}.csv`
    const mappingFile = `/Users/tmu16/Development/ott-pcms/.ignored/apple-feeds/apple-sle-map-${DATE}.json`
    const allLeagesFile = `/Users/tmu16/Development/ott-pcms/.ignored/apple-feeds/all-leagues-${DATE}.json`
    const unmappedGenresFile = `/Users/tmu16/Development/ott-pcms/.ignored/apple-feeds/unmapped-genres-${DATE}.json`

    const genresData = JSON.parse(fs.readFileSync(genresFile));
    const mapping = {}
    const sports = {}
    const noGenre = []
    const leagues = []
    genresData.filter(it => it.code.startsWith('P7C')).forEach((sportsGenre, i) => {
        sports[sportsGenre.genreAlias.toLowerCase()] = sportsGenre.code
        console.log(sportsGenre.genreAlias)
    });

    const csvContent = fs.readFileSync(csvFile);
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    })

    records.forEach(csvLine => {
        const peacockSport = csvLine.peacockSport.trim()
        const genreCode = sports[peacockSport.toLowerCase()]
        const league = csvLine.peacockLeague.trim()
        if (!leagues.includes(league)) {
            leagues.push(league)
        }
        if (genreCode == null) {
            if (!noGenre.includes(peacockSport)) {
                noGenre.push(peacockSport)
            }
        } else {
            const leagueName = (csvLine.peacockLeague.trim() === "N/A") ? "null" : csvLine.peacockLeague.trim()
            const appleSportName = csvLine.appleSport.trim()
            const appleLeagueAbbr = csvLine.appleLeagueAbbr.trim()
            if (mapping[genreCode] == null) {
                mapping[genreCode] = {}
            }
            mapping[genreCode][leagueName] = {
                sportName: appleSportName,
                leagueAbbr: appleLeagueAbbr
            }
        }
    })
    leagues.sort()
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    fs.writeFileSync(allLeagesFile, JSON.stringify(leagues, null, 2));
    fs.writeFileSync(unmappedGenresFile, JSON.stringify(noGenre, null, 2));
})()
