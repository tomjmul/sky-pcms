#!/usr/bin/env node

const fs = require('fs');


episodes();

function episodes() {

    console.log('totalMovie, totalEpisode, totalSeries, totalSeasons, totalPartOfSeries, totalPartOfSeasons, unlinkedSeasons, unlinkedSeries');


    const file = '/Users/tmu16/Development/ott-pcms/.ignored/google-feeds/epidode-fix-to-analyse.json';
    const data = JSON.parse(fs.readFileSync(file));
    const movieIds = data.dataFeedElement.filter(df =>  df["@type" ] === "Movie").reduce((acc, curr) => {
        acc.add(curr['@id']);
        return acc;
    }, new Set());
    const episodeIds = data.dataFeedElement.filter(df =>  df["@type" ] === "TVEpisode").reduce((acc, curr) => {
        acc.add(curr['@id']);
        return acc;
    }, new Set());
    const seriesIds = data.dataFeedElement.filter(df =>  df["@type" ] === "TVSeries").reduce((acc, curr) => {
        acc.add(curr['@id']);
        return acc;
    }, new Set());
    const seasonIds = data.dataFeedElement.filter(df =>  df["@type" ] === "TVSeason").reduce((acc, curr) => {
        acc.add(curr['@id']);
        return acc;
    }, new Set());
    const partOfSeasonId = data.dataFeedElement.filter(df =>  df["@type" ] === "TVEpisode").reduce((acc, curr) => {
        acc.add(curr.partOfSeason['@id']);
        return acc;
    }, new Set());
    const partOfSeriesId = data.dataFeedElement.filter(df =>  df["@type" ] === "TVEpisode").reduce((acc, curr) => {
        acc.add(curr.partOfSeries['@id']);
        return acc;
    }, new Set());

    const unlinkedSeasons = new Set(
        [...partOfSeasonId].filter(x => !seasonIds.has(x)));
    const unlinkedSeries = new Set(
        [...partOfSeriesId].filter(x => !seriesIds.has(x)));


    console.log(`${movieIds.size}, ${episodeIds.size}, ${seriesIds.size}, ${seasonIds.size}, ${partOfSeriesId.size}, ${partOfSeasonId.size}, ${unlinkedSeasons.size}, ${unlinkedSeries.size}`)
}

function report() {
    console.log('date,totalEntries,addedEntries,removedEntries,intersectingCount,realStartDate,realEndDate,realStartAndEndDate,intersectingDelta,deltaPct,elipsis');

    for (let i = 4; i <= 16; i++) {
        let prevDay = i < 10 ? '0' + i : i + '';
        let currDay = i < 9 ? '0' + (i + 1) : (i + 1) + '';
        const prevDayFile = '/Users/tmu16/Development/ott-pcms/.ignored/google-feeds/05-' + prevDay + '-2020';
        const currDayFile = '/Users/tmu16/Development/ott-pcms/.ignored/google-feeds/05-' + currDay + '-2020';

        const previous = JSON.parse(fs.readFileSync(prevDayFile));
        const current = JSON.parse(fs.readFileSync(currDayFile));
        const setPrevious = idSet(previous);
        const setCurrent = idSet(current);
        const mapPrevious = idMap(previous);
        const mapCurrent = idMap(current);

        const removed = new Set(
            [...setPrevious].filter(x => !setCurrent.has(x)));
        const added = new Set(
            [...setCurrent].filter(x => !setPrevious.has(x)));
        const intersection = new Set(
            [...setPrevious].filter(x => setCurrent.has(x))
        );
        const changedDates = [...intersection].reduce((acc, curr) => {
            if (JSON.stringify(mapPrevious.get(curr).potentialAction[0].actionAccessibilityRequirement) !== JSON.stringify(mapCurrent.get(curr).potentialAction[0].actionAccessibilityRequirement)) {
                acc.push({previous: mapPrevious.get(curr), current: mapCurrent.get(curr)});
            }
            return acc;
        }, []);
        const elipsis = current.dataFeedElement.filter(c => c.name.trim().endsWith("..."));

        const realDates = current.dataFeedElement.reduce((acc, curr) => {
            if (curr.potentialAction[0].actionAccessibilityRequirement.filter(aa => aa.availabilityStarts !== "2020-01-01T00:00:00Z" && aa.availabilityEnds === "2030-01-01T00:00:00Z").length > 0) {
                acc.realStartDates.push(curr)
            } else if (curr.potentialAction[0].actionAccessibilityRequirement.filter(aa => aa.availabilityStarts === "2020-01-01T00:00:00Z" && aa.availabilityEnds !== "2030-01-01T00:00:00Z").length > 0) {
                acc.realEndDates.push(curr)
            } else if (curr.potentialAction[0].actionAccessibilityRequirement.filter(aa => aa.availabilityStarts !== "2020-01-01T00:00:00Z" && aa.availabilityEnds !== "2030-01-01T00:00:00Z").length > 0) {
                acc.realAllDates.push(curr)
            }
            return acc;
        }, {realStartDates: [], realEndDates: [], realAllDates: []});

        const data = {
            date: '05-' + currDay + '-2020',
            totalEntries: setCurrent.size,
            addedEntries: added.size,
            removedEntries: removed.size,
            intersectingCount: intersection.size,
            realStartDate: realDates.realStartDates.length,
            realEndDate: realDates.realEndDates.length,
            realStartAndEndDate: realDates.realAllDates.length,
            intersectingDelta: changedDates.length,
            deltaPct: (changedDates.length / intersection.size) * 100,
            elipsisCount: elipsis.length
        };

        console.log(Object.keys(data).map(k => data[k]).join(","));

    }
}

function idSet(data) {
    return data.dataFeedElement.reduce((acc, curr) => {
        acc.add(curr['@id']);
        return acc;
    }, new Set())
}

function idMap(data) {
    return data.dataFeedElement.reduce((acc, curr) => {
        acc.set(curr['@id'], curr);
        return acc;
    }, new Map())
}
