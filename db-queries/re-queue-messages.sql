select fmq.id from content.proposition_feedmessagequeue fmq
join content.proposition p on p.id = fmq.pid and p.code = 'SKYQ' and p.territory = 'AT'
where fmq.created > now() - INTERVAL '7 DAYS' and fmq.status = 'PROCESSED';


select * from proposition_feedmessagequeue where id='039d6fec-7739-11ec-9207-cf8070f452d8';


select * from feedmessage where id='ID:f3dcc426866f-33801-1642090577937-1:18:10216:1:1'


SELECT * FROM
    (
    SELECT
        M.message -> 'localizableInformation' -> 0->> 'titleNameMedium' AS 	title,
				M.message -> 'localizableInformation' -> 0->> 'language' AS	language,
				M.message ->> 'contentId' contentId,
				M.message ->> 'providerId' providerId,
				M.message ->> 'providerVariantId' providerVariantId,
        M.message ->> 'contentSegments' contentSegments,
        M.message ->> 'programmeUuid' programmeUuid,
        M.message ->> 'providerSeriesId' providerSeriesId,
        M.message ->> 'providerSeasonId' providerSeasonId,
        M.message ->> 'accessChannel' accessChannel,
				M.*
    FROM
        (
        SELECT
            id, json_array_elements ( feedmessage.message -> 'updateEntities' ) AS message
        FROM
            ( SELECT * FROM CONTENT.feedmessage ) AS feedmessage
        ) AS M
    ) AS res
WHERE
    res.programmeuuid = 'b48e2637-dcbc-471a-b41c-2564948f6a72';



update content.node_checksum set checksum = checksum + 20
where nodeid in (
select n.id from content.proposition_feedmessagequeue fmq
join content.proposition p on p.id = fmq.pid and p.code = 'SKYQ' and p.territory = 'AT'
join content.externalid e on e.source = 'CONTENT_ID' and e.extref = fmq.contentid
join content.node n on n.id = e.nodeid and n.pid = fmq.pid
where fmq.created > now() - INTERVAL '7 DAYS' and fmq.status = 'PROCESSED')	;


UPDATE content.proposition_feedmessagequeue SET status='QUEUED', finished=NULL
WHERE id in (
select fmq.id from content.proposition_feedmessagequeue fmq
join content.proposition p on p.id = fmq.pid and p.code = 'SKYQ' and p.territory = 'AT'
where fmq.created > now() - INTERVAL '7 DAYS' and fmq.status = 'PROCESSED'
);

select count(*) from proposition_feedmessagequeue where status='QUEUED';
