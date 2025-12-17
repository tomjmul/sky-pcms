select * from dq.fragment where uuid='8b0dc52a-564c-336a-9d16-b6a03338eda4';

select * from dq.fragment where "type"='VENUE' or type='EVENT'

select * from data;

select * from externalid where extref='e8948615-3c86-38a8-bee6-b4bda0b5bdb5'

select * from datagramvariant where nodeid='fe289a84-4c9d-11ec-9803-af868ae5ee24';

select * from dq.fragment order by lastupdated desc limit 20;

SELECT * from (
select * from dq.message_log ORDER BY received desc limit 3000
) i
where i.data like '%VENUE%'

select * from dq.message_log where data::json -> 'updateEntities' -> 0 -> 'fragmentType' = 'EVENT' ORDER BY received desc limit 320;

{"tags": null, "uuid": "dbfad8dd-d2c8-34c1-bf11-22b14670b9fc", "links": null, "images": [], "aliases": null, "venueUuid": "8b0dc52a-564c-336a-9d16-b6a03338eda4", "alternateId": null, "lastUpdated": "2021-12-01T16:35:04Z", "fragmentType": "EVENT", "disciplineUuid": "5bd2e949-bfc1-36ac-b1f5-bef313dace77", "competitionUuid": "f2b796db-57b4-3b72-973d-50562bdbab71", "localizableInformation": [{"title": "NOTRE DAME FOOTBALL", "locale": "en-US", "description": null}]}


select count(*) from dq.fragment_queue;

select * from content.datagramvariant where name='EVENT_IDS';


SELECT DISTINCT on (i.id)
	i.ID,
	sleTitle,
	i.lastmodified,
	eventId,
	f2.DATA ->> 'country' AS country,
	f2.DATA ->> 'localizableInformation' AS venueInfo 
FROM
	(
	SELECT
		n.*, title.values ->> 0 sleTitle,
		jsonb_array_elements_text ( events."values" ) AS eventId 
	FROM
		"content".node n
		LEFT JOIN "content".datagramvariant title ON title.nodeid = n.ID AND title."name" = 'TITLE' AND title.context IS NULL
		LEFT JOIN "content".datagramvariant vName ON vName.nodeid = n.ID AND vName."name" = 'VENUE_NAME' AND vName.context IS NULL 
		LEFT JOIN "content".datagramvariant vCity ON vCity.nodeid = n.ID AND vCity."name" = 'VENUE_CITY' AND vCity.context IS NULL 
		LEFT JOIN "content".datagramvariant vCountry ON vCountry.nodeid = n.ID AND vCountry."name" = 'VENUE_COUNTRY' AND vCountry.context IS NULL 
		LEFT JOIN "content".datagramvariant events ON events.nodeid = n.ID AND events."name" = 'EVENT_IDS' AND events.context IS NULL 
	WHERE
		n."type" = 'ASSET' 
		AND n.subtype = 'SLE' 
		AND vName."values" IS NULL 
		AND vCity."values" IS NULL 
		AND vCountry."values" IS NULL 
		AND events."values" IS NOT NULL 
	) AS i
	LEFT JOIN dq.fragment f ON f.uuid :: TEXT = eventId
	LEFT JOIN dq.fragment f2 ON f2.uuid :: TEXT = f."data" ->> 'venueUuid' 
where f2.DATA ->> 'country' is not null
and f2.DATA ->> 'localizableInformation' is not null
and jsonb_array_length(f2.DATA -> 'localizableInformation' ) > 0
ORDER BY i.id, f2.lastupdated desc, f.lastupdated desc


delete from datagramvariant where "name" like "VENUE%":

select * from datagramvariant where "name" like "VENUE%":
