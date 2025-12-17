/* Return the SEASON/SERIES hierarchy for an episode */
select * from
	(select n.id as episodeId, dv."values"->>0 as episodeTitle, dv0."values"->>0 as episodeName, nci.nodeid as seasonId, nci2.nodeid as seriesId, dv2."values"->>0 as seriesName from node_data n
		LEFT JOIN datagramvariant dv on dv.nodeid=n.id and dv."name" = 'TITLE' and dv.context is null
		LEFT JOIN datagramvariant dv0 on dv0.nodeid=n.id and dv0."name" = 'EPISODE_NAME' and dv0.context is null
		LEFT JOIN nodecollectionitem nci on nci.memberid=n.id and nci.subtype='SEASON'
		LEFT JOIN nodecollectionitem nci2 on nci2.memberid=nci.nodeid and nci2.subtype='SERIES'
		LEFT JOIN datagramvariant dv2 on dv2.nodeid=nci2.nodeid and dv2.name='TITLE' and dv2.context is null
		where n.subtype='EPISODE'
		order by n.id desc
		limit 2000) sub;


select dv.nodeid, dv."values"->>0 as providerId, dv2.values->>0 as title, dv3.values->>0 as synopsis from datagramvariant dv
left JOIN datagramvariant dv2 on dv2.nodeid=dv.nodeid and dv2.name='TITLE' and dv2.context is null
left JOIN datagramvariant dv3 on dv3.nodeid=dv2.nodeid and dv3.name='SYNOPSIS' and dv3.context is null
where dv.name = 'PROVIDER_ID' and dv."values"->>0='8213715354709129105'
and dv2."values" is not null and dv.context is null order by dv.nodeid asc;
