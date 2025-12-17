#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios');

const DATE = 'PROD SYNDICATE Logo change';
const channelsFile = `linear-channels-${DATE}.json`;
const hostname = 'cms.atom.nowtv.com/';
const context = '06fd90b8-1d59-4a94-af63-e2c5529de872';
const proposition = 'NOWTV';
const territory = 'IT';
const url = `http://${hostname}/core/ref_data/version/linear?context=${context}`;

const headers = {
    'Content-Type': 'application/json',
    'X-Skyott-Proposition': proposition,
    'X-Skyott-Territory': territory,
    'X-SkyOTT-Service': 'service-integration@pcms.uk',
    'origin': 'https://cms.atom.nowtv.com/',
    'X-SkyOTT-ServiceToken': 'admin',
    'X-Skyott-Language': 'en',
    'Accept': 'application/json'
};

(async () => {
    try {
        const updateList = [];
        const response = await axios.get(url, { headers });
        const channels = response.data.payload;
        const versionName = channels[0].languageValues.ANY.ref_versionName.current;
        const serviceKeyRanges = [
          {start:7111,end:7130},
          {start:7135,end:7139}
        ]
        let rank = 184

        channels.forEach((channel, index) => {

          if (serviceKeyRanges.some (range=>Number(channel.languageValues.ANY.SERVICE_KEY.current) >= range.start && Number(channel.languageValues.ANY.SERVICE_KEY.current) <= range.end)) {
                updateList.push({
                    "nodeId": channel.id,
                    "variants": [
                        {
                          "name": "RANK",
                          "overrideValues": [],
                          "attribute": {
                            "name": "RANK",
                            "type": "REFDATA",
                            "subType": "linear_channel",
                            "multiValue": false,
                            "languageAgnostic": true,
                            "datagramValueType": "INTEGER",
                            "rank": 18,
                            "uihint": {
                              "hidden": true
                            },
                            "visibleOnClientApi": true,
                            "editableRoles": [],
                            "propositional": false,
                            "typePath": "/REFDATA/linear_channel",
                            "validators": [],
                            "metadata": {},
                            "translationKey": "model.attribute.rank"
                          },
                          "language": "ANY",
                          "values": [
                            rank++
                          ]
                        },
                    ]
                });
            } else {
                // Include other channels without changes
                updateList.push({
                    "nodeId": channel.id,
                    "variants": []
                });
            }
        });

        const output = {
            "updateList": updateList,
            "context": context,
            "versionName": versionName
        };

        fs.writeFileSync(channelsFile, JSON.stringify(output, null, 2));
        console.log(`Channels data written to ${channelsFile}`); // tells me what file the data is written to
    } catch (error) {
        console.error('Error:', error); // prints out the errors
    }
})();
