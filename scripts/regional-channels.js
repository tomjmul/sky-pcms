#!/usr/bin/env node

/*

 */

const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const DATE = '19-01-23';
const LOGO_TEMPLATE = "https://imageservice.disco.peacocktv.com/logo/{key}/AGG_SOURCE/{width}/{height}?proposition=NBCUOTT&territory=US"
const mapping = {
    "serviceKey": "Service Key",
    "channelName": "Channel Name",
    "gracenoteId": "Gracenote ID",
    "darkLogoKey": "Light Logo Key",
    "lightLogoKey": "Dark Logo Key",
    "contentSegment": "Content Segment",
    "sectionNavigation": "Section Navigation",
    "classification": "Classification",
    "privacyRestrictions": "Privacy Restrictions",
}

const csvFile = `/Users/tommy/Development/ott-pcms/.ignored/regional_channels/regional-channels-${DATE}.csv`
const channelsFile = `/Users/tommy/Development/ott-pcms/.ignored/regional_channels/regional-channels-${DATE}.json`
const regionalChannels = []
const csvContent = fs.readFileSync(csvFile);
const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
})

var rank = 1
records.forEach(csvLine => {
    regionalChannels.push({
        "serviceKey": "" + csvLine[mapping.serviceKey].trim(),
        "providerTerritory": "US",
        "gracenoteId": "" + csvLine[mapping.gracenoteId].trim(),
        "rank": rank++,
        "channelName": "" + csvLine[mapping.channelName].trim(),
        "logos": [
          {
            "type": "Default",
            "key": csvLine[mapping.darkLogoKey].trim(),
            "template": LOGO_TEMPLATE
          },
          {
            "type": "Light",
            "key": csvLine[mapping.lightLogoKey].trim(),
            "template": LOGO_TEMPLATE
          },
          {
            "type": "Dark",
            "key": csvLine[mapping.darkLogoKey].trim(),
            "template": LOGO_TEMPLATE
          }
        ],
        "hidden": false,
        "logoHeightPercentage": 12,
        "logoStyle": "cinema",
        "formatType": "SD",
        "sectionNavigation": csvLine[mapping.sectionNavigation].trim(),
        "contentSegments": [csvLine[mapping.contentSegment].trim()],
        "classifications": [
            csvLine[mapping.classification].trim().toUpperCase()
        ],
        "territories": [
          "US"
        ],
        "privacyRestrictions": [csvLine[mapping.privacyRestrictions].trim()],
        "channelAvailabilities": [
          {
            "onAir": 1019529021000,
            "offAir": 2145928811000
          }
        ]
      })
})
fs.writeFileSync(channelsFile, JSON.stringify(regionalChannels, null, 2));

