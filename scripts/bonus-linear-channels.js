#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios');

const channelName = `Bonus Stream Test`;
const formatType = 'SD';
const sectionNav = 'SPORTS';
const classification = 'SPORTS';
const sections = ['SPORTS_BONUS'];
const contentSegments = "SPORTS_BONUS"
const serviceKeyRanges = [
  {start: 7801, end: 7900}
];

const DATE = '27-06-24';
const channelsFile = `linear-channels-${DATE}.json`;
const hostname = 'cms.stage2.atom.nowtv.com';
const context = 'b25e6ce2-cc79-4cea-a17b-9503f4bb773d';
const proposition = 'NOWTV';
const territory = 'GB';
const url = `http://${hostname}/core/ref_data/version/linear?context=${context}`;

const headers = {
    'Content-Type': 'application/json',
    'X-Skyott-Proposition': proposition,
    'X-Skyott-Territory': territory,
    'X-SkyOTT-Service': 'service-integration@pcms.uk',
    'origin': 'http://local.pcms.sky.com',
    'X-SkyOTT-ServiceToken': 'admin',
    'X-Skyott-Language': 'en',
    'Accept': 'application/json'
};

(async () => {
    try {
        const updateList = [];
        const response = await axios.get(url, {headers});
        const channels = response.data.payload;
        var maxRank = Math.max(...channels.map(channel => channel.languageValues.ANY.RANK.current));
        const versionName = channels[0].languageValues.ANY.ref_versionName.current;

        channels.forEach(channel => {
            updateList.push({
                "nodeId": channel.id,
                "variants": []
            });
        });

        serviceKeyRanges.forEach(range => {
            for (let serviceKey = range.start; serviceKey <= range.end; serviceKey++) {
                updateList.push(newChannel(++maxRank, `${channelName} ${serviceKey}`, serviceKey, sectionNav, classification, contentSegments, sections, formatType));
            }
        });

        const output = {
            "updateList": updateList,
            "context": context,
            "versionName": versionName
        };

        fs.writeFileSync(channelsFile, JSON.stringify(output, null, 2));
        console.log(`Channels data written to ${channelsFile}`); //tells me what file the data is written to
    } catch (error) {
        console.error('Error:', error); //prints out the errors
    }
})();


function newChannel(rank, channelName, serviceKey, sectionNav, classification, contentSegments, sections, formatType = null, epgNumber = null) {
    const newChannel = {
        "refType": "linear_channel",
        "variants": [
            {
                "name": "SERVICE_KEY",
                "overrideValues": [],
                "attribute": {
                    "name": "SERVICE_KEY",
                    "type": "REFDATA",
                    "subType": "linear_channel",
                    "multiValue": false,
                    "languageAgnostic": true,
                    "datagramValueType": "STRING",
                    "rank": 8,
                    "uihint": {
                        "invalidateFormOnChange": true
                    },
                    "visibleOnClientApi": true,
                    "editableRoles": [],
                    "propositional": false,
                    "typePath": "/REFDATA/linear_channel",
                    "validators": [
                        {
                            "name": "UNIQUE_SERVICE_KEY",
                            "required": false,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "messageType": "ERROR",
                            "validatorClass": "com.sky.pcms.common.service.validation.ServiceKeyValidator",
                            "data": {}
                        },
                        {
                            "name": "NO_LEADING_TRAILING_WHITESPACE",
                            "required": false,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "regex": "^(\\S.{0,}\\S+|\\S?\\S?)$",
                            "messageType": "ERROR",
                            "message": "validation.noLeadingTrailingWhitespace",
                            "data": {}
                        }
                    ],
                    "metadata": {},
                    "translationKey": "model.attribute.service_key"
                },
                "language": "ANY",
                "values": [
                    serviceKey
                ]
            },
            {
                "name": "CHANNEL_NAME",
                "overrideValues": [],
                "attribute": {
                    "name": "CHANNEL_NAME",
                    "type": "REFDATA",
                    "subType": "linear_channel",
                    "multiValue": false,
                    "languageAgnostic": true,
                    "datagramValueType": "STRING",
                    "rank": 11,
                    "uihint": {},
                    "visibleOnClientApi": true,
                    "editableRoles": [],
                    "propositional": false,
                    "typePath": "/REFDATA/linear_channel",
                    "validators": [
                        {
                            "name": "REQUIRED",
                            "required": true,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "messageType": "ERROR",
                            "message": "Enter a value",
                            "data": {}
                        },
                        {
                            "name": "NO_LEADING_TRAILING_WHITESPACE",
                            "required": false,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "regex": "^(\\S.{0,}\\S+|\\S?\\S?)$",
                            "messageType": "ERROR",
                            "message": "validation.noLeadingTrailingWhitespace",
                            "data": {}
                        }
                    ],
                    "metadata": {},
                    "translationKey": "model.attribute.channel_name"
                },
                "language": "ANY",
                "values": [
                    channelName
                ]
            },
            {
                "name": "SECTION_NAVIGATION",
                "overrideValues": [],
                "attribute": {
                    "name": "SECTION_NAVIGATION",
                    "type": "REFDATA",
                    "subType": "linear_channel",
                    "multiValue": false,
                    "languageAgnostic": true,
                    "datagramValueType": "REF_CODE",
                    "refType": "sectionNavigation",
                    "rank": 14,
                    "uihint": {
                        "invalidateFormOnChange": true
                    },
                    "visibleOnClientApi": true,
                    "editableRoles": [],
                    "propositional": false,
                    "typePath": "/REFDATA/linear_channel",
                    "validators": [
                        {
                            "name": "REQUIRED",
                            "required": true,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "messageType": "ERROR",
                            "message": "Enter a value",
                            "data": {}
                        },
                        {
                            "name": "UNIQUE_SERVICE_KEY",
                            "required": false,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "messageType": "ERROR",
                            "validatorClass": "com.sky.pcms.common.service.validation.ServiceKeyValidator",
                            "data": {}
                        }
                    ],
                    "metadata": {},
                    "translationKey": "model.attribute.section_navigation"
                },
                "language": "ANY",
                "values": [
                    sectionNav
                ]
            },
            {
                "name": "CLASSIFICATION",
                "overrideValues": [],
                "attribute": {
                    "name": "CLASSIFICATION",
                    "type": "REFDATA",
                    "subType": "linear_channel",
                    "multiValue": true,
                    "languageAgnostic": true,
                    "datagramValueType": "REF_CODE",
                    "refType": "classification",
                    "rank": 15,
                    "uihint": {
                        "disabled": false
                    },
                    "visibleOnClientApi": true,
                    "editableRoles": [],
                    "propositional": false,
                    "typePath": "/REFDATA/linear_channel",
                    "validators": [
                        {
                            "name": "REQUIRED",
                            "required": true,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "messageType": "ERROR",
                            "message": "Enter a value",
                            "data": {}
                        }
                    ],
                    "metadata": {},
                    "translationKey": "model.attribute.classification"
                },
                "language": "ANY",
                "values": [
                    classification
                ]
            },
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
                    rank
                ]
            },
            {
                "name": "SECTIONS",
                "overrideValues": [],
                "attribute": {
                    "name": "SECTIONS",
                    "type": "REFDATA",
                    "subType": "linear_channel",
                    "multiValue": true,
                    "languageAgnostic": true,
                    "datagramValueType": "REF_CODE",
                    "refType": "sections",
                    "rank": 23,
                    "uihint": {
                        "hidden": false,
                        "maxItems": "5"
                    },
                    "visibleOnClientApi": true,
                    "editableRoles": [],
                    "propositional": false,
                    "typePath": "/REFDATA/linear_channel",
                    "validators": [
                        {
                            "name": "NO_LEADING_TRAILING_WHITESPACE",
                            "required": false,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "regex": "^(\\S.{0,}\\S+|\\S?\\S?)$",
                            "messageType": "ERROR",
                            "message": "validation.noLeadingTrailingWhitespace",
                            "data": {}
                        },
                        {
                            "name": "MAX_SECTIONS_ITEMS",
                            "required": false,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "messageType": "ERROR",
                            "message": "Select up to 5 options",
                            "data": {}
                        }
                    ],
                    "metadata": {},
                    "translationKey": "model.attribute.sections"
                },
                "language": "ANY",
                "values": sections
            },
            {
              "name": "CONTENT_SEGMENTS",
              "overrideValues": [],
              "attribute": {
                  "name": "CONTENT_SEGMENTS",
                  "type": "REFDATA",
                  "subType": "linear_channel",
                  "multiValue": true,
                  "languageAgnostic": true,
                  "datagramValueType": "REF_CODE",
                  "refType": "contentSegments",
                  "uihint": {
                      "hidden": false
                  },
                  "visibleOnClientApi": true,
                  "editableRoles": [],
                  "propositional": false,
                  "typePath": "/REFDATA/linear_channel",
                  "validators": [
                      {
                          "name": "REQUIRED",
                          "required": true,
                          "unique": false,
                          "min": 0,
                          "max": 2147483647,
                          "decimalplaces": 0,
                          "messageType": "ERROR",
                          "message": "Enter a value",
                          "data": {}
                      }
                  ],
                  "metadata": {},
                  "translationKey": "model.attribute.content_segments"
              },
              "language": "ANY",
              "values": [
                  contentSegments
              ]
          },
            {
                "name": "LOGO",
                "overrideValues": [],
                "attribute": {
                    "name": "LOGO",
                    "type": "REFDATA",
                    "subType": "linear_channel",
                    "multiValue": true,
                    "languageAgnostic": true,
                    "datagramValueType": "LOGO",
                    "rank": 24,
                    "uihint": {
                        "componentId": "CHANNEL_LOGO",
                        "wideDisplay": true
                    },
                    "visibleOnClientApi": true,
                    "editableRoles": [],
                    "propositional": false,
                    "typePath": "/REFDATA/linear_channel",
                    "validators": [
                        {
                            "name": "REQUIRED_CHANNEL_LOGO",
                            "required": false,
                            "unique": false,
                            "min": 0,
                            "max": 2147483647,
                            "decimalplaces": 0,
                            "messageType": "ERROR",
                            "message": "Default logo is required",
                            "data": {}
                        }
                    ],
                    "metadata": {},
                    "translationKey": "model.attribute.logo"
                },
                "language": "ANY",
                "values": [
                    {
                        "key": `skychb_7355_lightnow`,
                        "type": "Light",
                        "template": "https://images.metadata.sky.com/pd-logo/{key}/{width}/{height}"
                    },
                    {
                        "type": "Default",
                        "key": `skychb_7355_darknow`,
                        "template": "https://images.metadata.sky.com/pd-logo/{key}/{width}/{height}"
                    },
                    {
                        "key": `skychb_7355_darknow`,
                        "type": "Dark",
                        "template": "https://images.metadata.sky.com/pd-logo/{key}/{width}/{height}"
                    }
                ]
            }
        ]
    }

    if (formatType) {
        newChannel.variants.push({
            "name": "FORMAT_TYPE",
            "overrideValues": [],
            "attribute": {
                "name": "FORMAT_TYPE",
                "type": "REFDATA",
                "subType": "linear_channel",
                "multiValue": false,
                "languageAgnostic": true,
                "datagramValueType": "STRING",
                "rank": 20,
                "uihint": {
                    "hidden": false,
                    "invalidateFormOnChange": true
                },
                "visibleOnClientApi": true,
                "editableRoles": [],
                "propositional": false,
                "typePath": "/REFDATA/linear_channel",
                "validators": [
                    {
                        "name": "UNIQUE_SERVICE_KEY",
                        "required": false,
                        "unique": false,
                        "min": 0,
                        "max": 2147483647,
                        "decimalplaces": 0,
                        "messageType": "ERROR",
                        "validatorClass": "com.sky.pcms.common.service.validation.ServiceKeyValidator",
                        "data": {}
                    },
                    {
                        "name": "NO_LEADING_TRAILING_WHITESPACE",
                        "required": false,
                        "unique": false,
                        "min": 0,
                        "max": 2147483647,
                        "decimalplaces": 0,
                        "regex": "^(\\S.{0,}\\S+|\\S?\\S?)$",
                        "messageType": "ERROR",
                        "message": "validation.noLeadingTrailingWhitespace",
                        "data": {}
                    }
                ],
                "metadata": {},
                "translationKey": "model.attribute.format_type"
            },
            "language": "ANY",
            "values": [
                formatType
            ]
        })
    }

    if (epgNumber) {
        newChannel.variants.push({
            "name": "EPG_NUMBER",
            "overrideValues": [],
            "attribute": {
                "name": "EPG_NUMBER",
                "type": "REFDATA",
                "subType": "linear_channel",
                "multiValue": false,
                "languageAgnostic": true,
                "datagramValueType": "INTEGER",
                "rank": 16,
                "uihint": {},
                "visibleOnClientApi": true,
                "editableRoles": [],
                "propositional": false,
                "typePath": "/REFDATA/linear_channel",
                "validators": [
                    {
                        "name": "SKYGO_REQUIRED",
                        "required": false,
                        "unique": false,
                        "min": 0,
                        "max": 2147483647,
                        "decimalplaces": 0,
                        "messageType": "ERROR",
                        "message": "Enter a value",
                        "validatorClass": "com.sky.pcms.common.service.validation.PropositionRequiredValidator",
                        "data": {
                            "propositions": [
                                "FUNCTIONALTEST-UK",
                                "SKYGO-GB"
                            ]
                        }
                    },
                    {
                        "name": "UNIQUE_WARNING",
                        "required": false,
                        "unique": false,
                        "min": 0,
                        "max": 2147483647,
                        "decimalplaces": 0,
                        "messageType": "WARNING",
                        "message": "Is not unique",
                        "data": {}
                    }
                ],
                "metadata": {},
                "translationKey": "model.attribute.epg_number"
            },
            "language": "ANY",
            "values": [
                epgNumber
            ]
        })
    }

    return newChannel
}


